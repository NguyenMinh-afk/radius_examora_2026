import {
  sequelize,
  ExamAssignment,
  Exam,
  StudentAssignment,
  Attempt,
  AttemptAnswer,
  ExamQuestion,
  User,
  Class,
} from '../../models/index.js';
import { enqueueExamCompleted } from '../../config/outbox.js';

const QUESTION_SERVICE_URL = process.env.QUESTION_SERVICE_URL || 'http://localhost:3002';

class ExamService {
  async getAssignmentQuestions(studentId, assignmentId) {
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

    const questionIds = examQuestions.map((question) => question.question_id);
    const questionOrderMap = Object.fromEntries(
      examQuestions.map((question) => [
        question.question_id,
        { order: question.question_order, points: question.points },
      ])
    );

    const token = (await import('jsonwebtoken')).default;
    const jwtSecret =
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
    const serviceToken = token.sign(
      { id: studentId, role: 'student', token_type: 'access' },
      jwtSecret,
      { expiresIn: '5m' }
    );

    const questions = await Promise.allSettled(
      questionIds.map(async (questionId) => {
        const response = await fetch(`${QUESTION_SERVICE_URL}/api/questions/${questionId}`, {
          headers: { Authorization: `Bearer ${serviceToken}` },
        });
        if (!response.ok) return null;

        const data = await response.json();
        return {
          questionId: data.id,
          content: data.content,
          answers: (data.answers || []).map((answer) => ({
            id: answer.id,
            content: answer.content,
            isCorrect: answer.isCorrect,
          })),
        };
      })
    );

    const validQuestions = questions
      .filter((result) => result.status === 'fulfilled' && result.value !== null)
      .map((result) => result.value)
      .sort((first, second) => {
        const firstOrder = questionOrderMap[first.questionId]?.order || 0;
        const secondOrder = questionOrderMap[second.questionId]?.order || 0;
        return firstOrder - secondOrder;
      });

    return {
      assignmentId,
      title: assignment.title,
      instructions: assignment.instructions,
      duration: assignment.exam?.duration || 60,
      totalPoints: assignment.exam?.total_points || 0,
      questions: validQuestions,
    };
  }

  async resolveExamAssignment(studentId, assignmentId, transaction) {
    const assignment = await ExamAssignment.findByPk(assignmentId, {
      include: [
        {
          model: ExamQuestion,
          as: 'examQuestions',
          attributes: ['question_id', 'question_order', 'points'],
        },
      ],
      transaction,
    });

    if (!assignment) {
      throw new Error('Assignment not found');
    }
    if (!assignment.is_active) {
      throw new Error('This assignment is currently unavailable');
    }

    const [studentAssignment] = await StudentAssignment.findOrCreate({
      where: { student_id: studentId, assignment_id: assignmentId },
      defaults: {
        status: 'assigned',
        attempts_used: 0,
      },
      transaction,
    });

    const latestAttempt = await Attempt.findOne({
      where: { student_id: studentId, assignment_id: assignmentId },
      order: [['attempt_number', 'DESC']],
      transaction,
    });

    if (latestAttempt && ['submitted', 'graded'].includes(latestAttempt.status)) {
      return {
        status: 'submitted',
        attempt: latestAttempt,
        assignment,
        studentAssignment,
      };
    }

    const maxAttempts = assignment.max_attempts || 1;
    const attemptsUsed = studentAssignment.attempts_used || 0;
    if (attemptsUsed >= maxAttempts) {
      throw new Error('No attempts remaining for this assignment');
    }

    const now = new Date();
    if (assignment.end_time && new Date(assignment.end_time) < now) {
      throw new Error('This assignment has expired');
    }
    if (assignment.start_time && new Date(assignment.start_time) > now) {
      throw new Error('This assignment has not started yet');
    }

    return {
      status: latestAttempt?.status === 'in_progress' ? 'started' : 'available',
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
    const needNewAttempt =
      !attempt || attempt.status === 'submitted' || attempt.status === 'graded';

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

  async submitAttempt(studentId, assignmentId, answers, eventContext = {}) {
    const transactionResult = await sequelize.transaction(async (transaction) => {
      const resolved = await this.resolveExamAssignment(studentId, assignmentId, transaction);

      if (resolved.attempt && ['submitted', 'graded'].includes(resolved.attempt.status)) {
        return {
          result: {
            attempt: resolved.attempt,
            answers: [],
            wasAlreadySubmitted: true,
            summary: {
              score: resolved.attempt.score != null ? Number(resolved.attempt.score) : 0,
              percentage:
                resolved.attempt.percentage != null ? Number(resolved.attempt.percentage) : 0,
              correctAnswers: resolved.attempt.correct_answers || 0,
              wrongAnswers: resolved.attempt.wrong_answers || 0,
            },
          },
          notification: null,
        };
      }

      if (resolved.status !== 'started' || !resolved.attempt) {
        throw new Error('No active attempt to submit');
      }

      const examQuestions = resolved.assignment.examQuestions || [];
      const questionMap = new Map(
        examQuestions.map((question) => [question.question_id, question.points])
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

          return AttemptAnswer.create(
            {
              attempt_id: resolved.attempt.id,
              question_id: answer.questionId,
              selected_answer: answer,
              is_correct: isCorrect,
              points_earned: isCorrect ? Number(points) : 0,
              time_spent: answer.timeSpent || 0,
            },
            { transaction }
          );
        })
      );

      const percentage = resolved.assignment.total_points
        ? Math.round((Number(score) / Number(resolved.assignment.total_points)) * 100)
        : 0;

      await resolved.attempt.update(
        {
          ended_at: now,
          submitted_at: now,
          time_taken: Math.round((now - new Date(resolved.attempt.started_at)) / 1000),
          status: 'submitted',
          score,
          percentage,
          correct_answers: correctAnswers,
          wrong_answers: wrongAnswers,
        },
        { transaction }
      );

      await resolved.studentAssignment.update(
        {
          attempts_used: (resolved.studentAssignment.attempts_used || 0) + 1,
        },
        { transaction }
      );

      const assignmentClass = await Class.findByPk(resolved.assignment.class_id, {
        attributes: ['id', 'teacher_id', 'name'],
        transaction,
      });
      let notification = null;
      if (assignmentClass?.teacher_id) {
        const student = await User.findByPk(resolved.attempt.student_id, {
          attributes: ['full_name'],
          transaction,
        });
        notification = {
          userId: assignmentClass.teacher_id,
          message: {
            type: 'exam_submit',
            title: 'Học sinh đã nộp bài thi',
            content: `${student?.full_name || 'Học sinh'} đã nộp bài "${resolved.assignment.title}" - Điểm: ${score} (${percentage}%)`,
            metadata: {
              assignmentId: resolved.assignment.id,
              classId: assignmentClass.id,
              attemptId: resolved.attempt.id,
              score,
              percentage,
              action_url: '/teacher/results',
            },
          },
        };
      }

      await enqueueExamCompleted(
        {
          attemptId: resolved.attempt.id,
          assignmentId,
          studentId,
          score,
          percentage,
          correctAnswers,
          wrongAnswers,
          submittedAt: resolved.attempt.submitted_at,
        },
        eventContext,
        transaction
      );

      return {
        result: {
          attempt: resolved.attempt,
          answers: attemptAnswers,
          wasAlreadySubmitted: false,
          summary: {
            score,
            percentage,
            correctAnswers,
            wrongAnswers,
          },
        },
        notification,
      };
    });

    if (transactionResult.notification) {
      await this.sendNotification(
        transactionResult.notification.userId,
        transactionResult.notification.message
      );
    }

    return transactionResult.result;
  }

  async sendNotification(userId, { type, title, content, metadata = {} }) {
    try {
      const notificationUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3004';
      await fetch(`${notificationUrl}/api/notifications/internal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          type: type || 'system',
          title,
          content,
          metadata,
        }),
      });
    } catch (error) {
      console.error('[ExamService] Failed to send notification:', error.message);
    }
  }
}

export default new ExamService();
