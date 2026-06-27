/**
 * Teacher Assignment Service
 */
import { Op } from 'sequelize';
import {
  Class,
  ClassMember,
  Exam,
  ExamAssignment,
  Attempt
} from '../../models/index.js';

class AssignmentService {

  deriveAssignmentStatus(assignment) {
    const now = new Date();
    const startTime = new Date(assignment.start_time);
    const endTime = new Date(assignment.end_time);

    if (!assignment.is_active) return 'closed';
    if (now > endTime) return 'closed';
    if (now < startTime) return 'upcoming';
    return 'open';
  }

  async getAssignments(teacherId, filters = {}) {
    const { status, classId, search } = filters;

    const whereClause = { assigned_by: teacherId };
    if (classId) {
      whereClause.class_id = classId;
    }

    const assignments = await ExamAssignment.findAll({
      where: whereClause,
      include: [
        { model: Class, as: 'class', attributes: ['name', 'class_code'] },
        { model: Exam, as: 'exam', attributes: ['title'] }
      ],
      order: [['start_time', 'DESC']]
    });

    const items = [];
    const now = new Date();

    for (const a of assignments) {
      const submittedCount = await Attempt.count({ where: { assignment_id: a.id } });
      const gradedCount = await Attempt.count({ where: { assignment_id: a.id, status: 'graded' } });
      const studentAssigned = await ClassMember.count({ where: { class_id: a.class_id, role: 'student' } });

      const assignmentStatus = this.deriveAssignmentStatus(a);

      items.push({
        assignmentId: a.id,
        title: a.title,
        examName: a.exam?.title || a.title,
        className: a.class?.name || '',
        classId: a.class_id,
        startTime: a.start_time,
        endTime: a.end_time,
        maxAttempts: a.max_attempts,
        studentAssigned,
        submitted: submittedCount,
        graded: gradedCount,
        status: assignmentStatus
      });
    }

    // Filter
    let filtered = items;
    if (status && status !== 'all') {
      filtered = filtered.filter(item => item.status === status);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchLower) ||
        item.className.toLowerCase().includes(searchLower)
      );
    }

    const summary = {
      total: items.length,
      open: items.filter(i => i.status === 'open').length,
      upcoming: items.filter(i => i.status === 'upcoming').length,
      closed: items.filter(i => i.status === 'closed').length
    };

    return { items: filtered, summary };
  }

  async getSchedule(teacherId, year, month) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const assignments = await ExamAssignment.findAll({
      where: {
        assigned_by: teacherId,
        start_time: {
          [Op.and]: [
            { [Op.gte]: startDate },
            { [Op.lte]: endDate }
          ]
        }
      },
      include: [
        { model: Class, as: 'class', attributes: ['name'] },
        { model: Exam, as: 'exam', attributes: ['title'] }
      ],
      order: [['start_time', 'ASC']]
    });

    const items = assignments.map(a => ({
      assignmentId: a.id,
      examTitle: a.exam?.title || a.title,
      className: a.class?.name || '',
      scheduledAt: a.start_time,
      startTime: a.start_time,
      endTime: a.end_time,
      status: this.deriveAssignmentStatus(a),
      studentCount: 0
    }));

    const summary = {
      totalAssignments: items.length,
      upcomingCount: items.filter(i => i.status === 'upcoming').length,
      openCount: items.filter(i => i.status === 'open').length,
      completedCount: items.filter(i => i.status === 'closed').length
    };

    return { items, summary };
  }
}

export default new AssignmentService();
