/**
 * Teacher Result Service
 */
import { Op } from 'sequelize';
import {
  User,
  UserProfile,
  Class,
  ExamAssignment,
  Attempt
} from '../../models/index.js';

class ResultService {

  async getResults(teacherId, filters = {}) {
    const { classId, assignmentId, status } = filters;

    const assignmentWhere = { assigned_by: teacherId };
    if (classId) {
      assignmentWhere.class_id = classId;
    }

    const assignments = await ExamAssignment.findAll({
      where: assignmentWhere,
      attributes: ['id', 'title', 'class_id']
    });
    const assignmentIds = assignments.map(a => a.id);

    const attemptWhere = {};
    if (assignmentIds.length > 0) {
      attemptWhere.assignment_id = { [Op.in]: assignmentIds };
    }
    if (status) {
      attemptWhere.status = status;
    }

    const attempts = await Attempt.findAll({
      where: attemptWhere,
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'full_name', 'email'],
          include: [{ model: UserProfile, as: 'profile' }]
        },
        { model: ExamAssignment, as: 'assignment', attributes: ['title', 'class_id'] },
        { model: Class, as: 'class', attributes: ['name'] }
      ],
      order: [['submitted_at', 'DESC']],
      limit: 100
    });

    return attempts.map(a => ({
      attemptId: a.attempt_id,
      studentId: a.student_id,
      studentName: a.student?.full_name || 'Unknown',
      studentEmail: a.student?.email || '',
      studentCode: a.student?.profile?.student_code || '',
      classId: a.assignment?.class_id || '',
      className: a.class?.name || '',
      assignmentId: a.assignment_id,
      assignmentTitle: a.assignment?.title || '',
      examName: a.assignment?.title || '',
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
