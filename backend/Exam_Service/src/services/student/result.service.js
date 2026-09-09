/**
 * Student Result Service
 */
import { Op } from 'sequelize';
import {
  Class,
  ExamAssignment,
  Attempt
} from '../../models/index.js';

class ResultService {

  async getResults(studentId, limit = 20) {
    const attempts = await Attempt.findAll({
      where: {
        student_id: studentId,
        status: { [Op.in]: ['submitted', 'graded'] }
      },
      include: [{
        model: ExamAssignment,
        as: 'assignment',
        attributes: ['id', 'title', 'start_time', 'end_time']
      }, {
        model: Class,
        as: 'class',
        attributes: ['name']
      }],
      order: [['submitted_at', 'DESC']],
      limit
    });

    return attempts.map(a => ({
      attemptId: a.id,
      examId: a.exam_id,
      assignmentId: a.assignment_id,
      title: a.assignment?.title,
      className: a.class?.name,
      attemptNumber: a.attempt_number,
      startedAt: a.started_at,
      submittedAt: a.submitted_at,
      timeTaken: a.time_taken,
      status: a.status,
      score: a.score ? parseFloat(a.score) : null,
      percentage: a.percentage ? parseFloat(a.percentage) : null,
      correctAnswers: a.correct_answers || 0,
      wrongAnswers: a.wrong_answers || 0
    }));
  }
}

export default new ResultService();
