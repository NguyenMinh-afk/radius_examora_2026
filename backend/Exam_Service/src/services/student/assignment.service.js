/**
 * Student Assignment Service
 */
import { Op } from 'sequelize';
import {
  User,
  Class,
  ExamAssignment,
  StudentAssignment,
  Attempt,
  Course
} from '../../models/index.js';

class AssignmentService {

  deriveAssignmentStatus(studentAssignment, latestAttempt = null) {
    const now = new Date();
    const assignment = studentAssignment.assignment || studentAssignment;

    if (!assignment) return 'unknown';

    const startTime = new Date(assignment.start_time);
    const endTime = new Date(assignment.end_time);
    const maxAttempts = assignment.max_attempts || 1;
    const attemptsUsed = studentAssignment.attempts_used || 0;

    if (latestAttempt && ['submitted', 'graded'].includes(latestAttempt.status)) {
      return 'submitted';
    }

    if (attemptsUsed >= maxAttempts) {
      return 'expired';
    }

    if (now > endTime) {
      return 'expired';
    }

    if (now >= startTime && now <= endTime) {
      return 'open';
    }

    if (now < startTime) {
      return 'upcoming';
    }

    return 'unknown';
  }

  async getAssignments(studentId, filters = {}) {
    const { status, search, classId } = filters;

    const assignmentInclude = {
      model: ExamAssignment,
      as: 'assignment',
      where: { is_active: true },
      required: true
    };

    if (classId) {
      assignmentInclude.where.class_id = classId;
    }

    const assignments = await StudentAssignment.findAll({
      where: { student_id: studentId },
      include: [assignmentInclude],
      order: [['assignment', 'start_time', 'DESC']]
    });

    const assignmentIds = assignments.map(a => a.id);
    const attempts = await Attempt.findAll({
      where: {
        student_id: studentId,
        assignment_id: assignmentIds
      },
      order: [['attempt_number', 'DESC']]
    });

    const classIds = [...new Set(assignments.map(a => a.assignment?.class_id).filter(Boolean))];
    const classes = await Class.findAll({
      where: { id: classIds },
      include: [
        { model: User, as: 'teacher', attributes: ['full_name'] },
        { model: Course, as: 'course', attributes: ['name'] }
      ]
    });
    const classMap = Object.fromEntries(classes.map(c => [c.id, c]));

    const items = assignments.map(sa => {
      const assignment = sa.assignment;
      const latestAttempt = attempts.find(at => at.assignment_id === sa.assignment_id);
      const cls = assignment?.class_id ? classMap[assignment.class_id] : null;

      return {
        studentAssignmentId: sa.id,
        assignmentId: sa.assignment_id,
        title: assignment?.title || 'Untitled Exam',
        courseName: cls?.course?.name || 'General',
        className: cls?.name || 'Unknown Class',
        classCode: cls?.class_code || '',
        teacherName: cls?.teacher?.full_name || 'Unknown',
        instructions: assignment?.instructions,
        startTime: assignment?.start_time,
        endTime: assignment?.end_time,
        duration: 60,
        maxAttempts: assignment?.max_attempts || 1,
        attemptsUsed: sa.attempts_used,
        status: this.deriveAssignmentStatus(sa, latestAttempt),
        latestAttempt: latestAttempt ? {
          attemptId: latestAttempt.id,
          score: latestAttempt.score ? parseFloat(latestAttempt.score) : null,
          percentage: latestAttempt.percentage ? parseFloat(latestAttempt.percentage) : null,
          submittedAt: latestAttempt.submitted_at
        } : null
      };
    });

    let filteredItems = items;
    if (status && status !== 'all') {
      filteredItems = items.filter(item => item.status === status);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredItems = filteredItems.filter(item =>
        item.title.toLowerCase().includes(searchLower)
      );
    }

    const summary = {
      total: items.length,
      open: items.filter(i => i.status === 'open').length,
      upcoming: items.filter(i => i.status === 'upcoming').length,
      submitted: items.filter(i => i.status === 'submitted').length,
      expired: items.filter(i => i.status === 'expired').length
    };

    return { items: filteredItems, summary };
  }
}

export default new AssignmentService();
