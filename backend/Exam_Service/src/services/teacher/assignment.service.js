/**
 * Teacher Assignment Service
 */
import axios from 'axios';
import { Op } from 'sequelize';
import {
  Class,
  ClassMember,
  Exam,
  ExamAssignment,
  StudentAssignment,
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
        { model: Exam, as: 'exam', attributes: ['title', 'duration', 'total_points', 'passing_score'] }
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
        status: assignmentStatus,
        // Exam properties
        duration: a.exam?.duration || 60,
        totalPoints: a.exam?.total_points || 0,
        passingScore: a.exam?.passing_score || 0,
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

  async createAssignment(teacherId, data) {
    const { examId, classId, startTime, endTime, maxAttempts = 1 } = data;

    // Verify exam exists
    const exam = await Exam.findByPk(examId);
    if (!exam) {
      throw new Error("Exam not found");
    }

    // Verify class exists and belongs to teacher
    const cls = await Class.findOne({
      where: { id: classId, teacher_id: teacherId }
    });
    if (!cls) {
      throw new Error("Class not found or you don't have permission");
    }

    // Get all students in the class
    const classMembers = await ClassMember.findAll({
      where: { class_id: classId, role: 'student' }
    });

    // Create assignment
    const assignment = await ExamAssignment.create({
      exam_id: examId,
      class_id: classId,
      title: exam.title,
      start_time: new Date(startTime),
      end_time: new Date(endTime),
      max_attempts: maxAttempts,
      is_active: true,
      assigned_by: teacherId,
    });

    // Create student assignment records for all students in class
    if (classMembers.length > 0) {
      const studentAssignmentRecords = classMembers.map(member => ({
        student_id: member.user_id,
        assignment_id: assignment.id,
        status: 'assigned',
        attempts_used: 0,
      }));
      await StudentAssignment.bulkCreate(studentAssignmentRecords);

      // Notify each student about the new assignment
      const notificationUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3004';
      await Promise.all(
        classMembers.map(member =>
          axios.post(`${notificationUrl}/api/notifications/internal`, {
            user_id: member.user_id,
            type: 'assignment',
            title: 'Bài thi mới được giao',
            content: `Bạn có bài thi mới "${exam.title}" trong lớp "${cls.name}"`,
            metadata: {
              assignmentId: assignment.id,
              classId: cls.id,
              className: cls.name,
              examName: exam.title,
              action_url: '/student/assignments',
            },
          }).catch(error => {
            console.error('[AssignmentService] Failed to send notification:', error.message);
          })
        )
      );
    }

    return {
      assignmentId: assignment.id,
      title: assignment.title,
      examName: exam.title,
      className: cls.name,
      startTime: assignment.start_time,
      endTime: assignment.end_time,
      maxAttempts: assignment.max_attempts,
      studentAssigned: classMembers.length,
    };
  }
}

export default new AssignmentService();
