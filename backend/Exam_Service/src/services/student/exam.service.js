import {
  ExamAssignment,
  Exam,
  StudentAssignment,
  Attempt,
  AttemptAnswer,
  ExamQuestion,
} from '../../models/index.js';

const QUESTION_SERVICE_URL = process.env.QUESTION_SERVICE_URL || 'http://localhost:3002';

class ExamService {

  async getAssignmentQuestions(studentId, assignmentId) {
    // Get ExamAssignment with its Exam and questions
    const assignment = await ExamAssignment.findByPk(assignmentId, {
      include: [
        { model: Exam, as: 'exam' },
        {
          model: ExamQuestion,
          as: 'examQuestions',
          attributes: ['question_id', 'question_order', 'points'],
          order: [['question_order', 'ASC']],
        },
      ],
    });

    if (!assignment) {
      throw new Error('Assignment not found');
    }

    const examQuestions = assignment.examQuestions || [];

    if (examQuestions.length === 0) {
      return {
        assignmentId,
        title: assignment.title,
        instructions: assignment.instructions,
        duration: assignment.exam?.duration || 60,
        totalPoints: assignment.exam?.total_points || 0,
        questions: [],
      };
    }

    const questionIds = examQuestions.map(eq => eq.question_id);
    const questionOrderMap = Object.fromEntries(
      examQuestions.map(eq => [eq.question_id, { order: eq.question_order, points: eq.points }])
    );

    const token = (await import('jsonwebtoken')).default;
    const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
    const serviceToken = token.sign(
      { id: studentId, role: 'student', token_type: 'access' },
      jwtSecret,
      { expiresIn: '5m' }
    );

    const questions = await Promise.allSettled(
      questionIds.map(async (qId) => {
        const res = await fetch(`${QUESTION_SERVICE_URL}/api/questions/${qId}`, {
          headers: { Authorization: `Bearer ${serviceToken}` },
        });
        if (!res.ok) return null;
        const data = await res.json();
        return {
          questionId: data.id,
          content: data.content,
          answers: (data.answers || []).map((a) => ({
            id: a.id,
            content: a.content,
            isCorrect: a.isCorrect,
          })),
        };
      })
    );

    const validQuestions = questions
      .filter(r => r.status === 'fulfilled' && r.value !== null)
      .map(r => r.value);

    const sortedQuestions = validQuestions.sort(
      (a, b) => {
        const aOrder = questionOrderMap[a.questionId]?.order || 0;
        const bOrder = questionOrderMap[b.questionId]?.order || 0;
        return aOrder - bOrder;
      }
    );

    return {
      assignmentId,
      title: assignment.title,
      instructions: assignment.instructions,
      duration: assignment.exam?.duration || 60,
      totalPoints: assignment.exam?.total_points || 0,
      questions: sortedQuestions,
    };
  }

  async resolveExamAssignment(studentId, assignmentId) {
    // First, find the ExamAssignment directly
    const assignment = await ExamAssignment.findByPk(assignmentId);

    if (!assignment) {
      throw new Error('Assignment not found');
    }

    if (!assignment.is_active) {
      throw new Error('This assignment is currently unavailable');
    }

    // Find or create StudentAssignment for this student
    let [studentAssignment] = await StudentAssignment.findOrCreate({
      where: { student_id: studentId, assignment_id: assignmentId },
      defaults: {
        status: 'assigned',
        attempts_used: 0,
      },
    });

    // Get latest attempt
    const latestAttempt = await Attempt.findOne({
      where: { student_id: studentId, assignment_id: assignmentId },
      order: [['attempt_number', 'DESC']],
    });

    // Check if already submitted/graded
    if (latestAttempt && ['submitted', 'graded'].includes(latestAttempt.status)) {
      return {
        status: 'submitted',
        attempt: latestAttempt,
        assignment,
        studentAssignment,
      };
    }

    // Check attempts limit
    const maxAttempts = assignment.max_attempts || 1;
    const attemptsUsed = studentAssignment.attempts_used || 0;

    if (attemptsUsed >= maxAttempts) {
      throw new Error('No attempts remaining for this assignment');
    }

    // Check if expired
    const now = new Date();
    if (assignment.end_time && new Date(assignment.end_time) < now) {
      throw new Error('This assignment has expired');
    }

    // Check if not started yet (start_time is in future)
    if (assignment.start_time && new Date(assignment.start_time) > now) {
      throw new Error('This assignment has not started yet');
    }

    return {
      status: 'available',
      attempt: latestAttempt,
      assignment,
      studentAssignment,
    };
  }

  async startAttempt(studentId, assignmentId) {
    const resolved = await this.resolveExamAssignment(studentId, assignmentId);

    if (resolved.status === 'submitted' || resolved.status === 'graded') {
      return resolved;
    }

    const now = new Date();
    const attemptNumber = (resolved.attempt?.attempt_number || 0) + 1;

    const attemptWhere = {
      student_id: studentId,
      exam_id: resolved.assignment.exam_id,
      assignment_id: resolved.assignment.id,
      attempt_number: attemptNumber,
    };

    let attempt = resolved.attempt;
    const needNewAttempt = !attempt || attempt.status === 'submitted' || attempt.status === 'graded';

    if (needNewAttempt) {
      attempt = await Attempt.create({
        ...attemptWhere,
        started_at: now,
        status: 'in_progress',
      });
    }

    resolved.attempt = attempt;
    resolved.status = 'started';
    return resolved;
  }

  async submitAttempt(studentId, assignmentId, answers) {
    const resolved = await this.resolveExamAssignment(studentId, assignmentId);

    if (!resolved.attempt || resolved.attempt.status === 'submitted' || resolved.attempt.status === 'graded') {
      return {
        attempt: resolved.attempt,
        answers: [],
        summary: {
          score: resolved.attempt.score != null ? Number(resolved.attempt.score) : 0,
          percentage: resolved.attempt.percentage != null ? Number(resolved.attempt.percentage) : 0,
          correctAnswers: resolved.attempt.correct_answers || 0,
          wrongAnswers: resolved.attempt.wrong_answers || 0,
        },
      };
    }

    if (resolved.status !== 'started' || !resolved.attempt) {
      throw new Error('No active attempt to submit');
    }

    const examQuestions = resolved.assignment.examQuestions || [];
    const questionMap = new Map(
      examQuestions.map((question) => [question.question_id, question.points]),
    );

    const now = new Date();
    let correctAnswers = 0;
    let wrongAnswers = 0;
    let score = 0;

    const attemptAnswers = await Promise.all(
      answers.map((answer) => {
        const points = questionMap.get(answer.questionId) || 0;
        const isCorrect = Boolean(answer.isCorrect);
        if (isCorrect) {
          correctAnswers += 1;
          score += Number(points);
        } else {
          wrongAnswers += 1;
        }

        return AttemptAnswer.create({
          attempt_id: resolved.attempt.id,
          question_id: answer.questionId,
          selected_answer: answer,
          is_correct: isCorrect,
          points_earned: isCorrect ? Number(points) : 0,
          time_spent: answer.timeSpent || 0,
        });
      })
    );

    const percentage = resolved.assignment.total_points
      ? Math.round((Number(score) / Number(resolved.assignment.total_points)) * 100)
      : 0;

    await resolved.attempt.update({
      ended_at: now,
      submitted_at: now,
      time_taken: Math.round((now - new Date(resolved.attempt.started_at)) / 1000),
      status: 'submitted',
      score,
      percentage,
      correct_answers: correctAnswers,
      wrong_answers: wrongAnswers,
    });

    await resolved.studentAssignment.update({
      attempts_used: (resolved.studentAssignment.attempts_used || 0) + 1,
    });

    return {
      attempt: resolved.attempt,
      answers: attemptAnswers,
      summary: {
        score,
        percentage,
        correctAnswers,
        wrongAnswers,
      },
    };
  }
}

export default new ExamService();
