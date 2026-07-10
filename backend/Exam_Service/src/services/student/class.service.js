/**
 * Student Class Service
 */
import axios from 'axios';
import { Op } from 'sequelize';
import sequelize from '../../config/sequelize.js';
import {
  User,
  Class,
  ClassMember,
  ExamAssignment,
  StudentAssignment,
  Attempt,
  Course
} from '../../models/index.js';

class ClassService {

  async sendNotification(userId, { type, title, content, metadata = {} }) {
    try {
      const notificationUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3004';
      await axios.post(`${notificationUrl}/api/notifications/internal`, {
        user_id: userId,
        type: type || 'system',
        title,
        content,
        metadata,
      });
    } catch (error) {
      console.error('[ClassService] Failed to send notification:', error.message);
    }
  }

  async getClasses(studentId) {
    const classMembers = await ClassMember.findAll({
      where: { user_id: studentId, role: 'student' },
      include: [{
        model: Class,
        as: 'class',
        include: [
          { model: User, as: 'teacher', attributes: ['id', 'full_name', 'avatar_url'] },
          { model: Course, as: 'course', attributes: ['name'] },
          { model: ExamAssignment, as: 'examAssignments', where: { is_active: true } }
        ]
      }]
    });

    const result = [];

    for (const cm of classMembers) {
      const cls = cm.class;
      if (!cls) continue;

      const totalAssignments = cls.examAssignments?.length || 0;

      // Count completed assignments by checking attempts directly
      const completedCount = await Attempt.count({
        where: {
          student_id: studentId,
          status: { [Op.in]: ['submitted', 'graded'] }
        },
        include: [{
          model: ExamAssignment,
          as: 'assignment',
          where: { class_id: cls.id },
          required: true
        }]
      });

      const now = new Date();
      const openCount = cls.examAssignments?.filter(a => {
        const start = new Date(a.start_time);
        const end = new Date(a.end_time);
        return now >= start && now <= end;
      }).length || 0;

      const upcomingCnt = cls.examAssignments?.filter(a => {
        const start = new Date(a.start_time);
        return start > now;
      }).length || 0;

      const avgResult = await Attempt.findOne({
        where: { student_id: studentId },
        attributes: [[sequelize.fn('AVG', sequelize.col('score')), 'avgScore']],
        raw: true
      });

      result.push({
        classId: cls.id,
        className: cls.name,
        classCode: cls.class_code,
        courseId: cls.course_id,
        courseName: cls.course?.name,
        teacherId: cls.teacher_id,
        teacherName: cls.teacher?.full_name,
        yearLevel: cls.year_level,
        semester: cls.semester,
        academicYear: cls.academic_year,
        isActive: cls.is_active,
        joinedAt: cm.joined_at,
        stats: {
          totalAssignments,
          completedAssignments: completedCount,
          openAssignments: openCount,
          upcomingAssignments: upcomingCnt,
          averageScore: avgResult?.avgScore ? parseFloat(parseFloat(avgResult.avgScore).toFixed(1)) : 0
        }
      });
    }

    return result;
  }

  async getClassDetail(studentId, classId) {
    const membership = await ClassMember.findOne({
      where: { user_id: studentId, class_id: classId, role: 'student' }
    });

    if (!membership) {
      throw new Error('You are not a member of this class');
    }

    const cls = await Class.findByPk(classId, {
      include: [
        { model: User, as: 'teacher', attributes: ['id', 'full_name', 'avatar_url'] },
        { model: Course, as: 'course', attributes: ['name'] },
        { model: ExamAssignment, as: 'examAssignments', where: { is_active: true } }
      ]
    });

    if (!cls) {
      throw new Error('Class not found');
    }

    const assignments = await StudentAssignment.findAll({
      where: { student_id: studentId },
      include: [{
        model: ExamAssignment,
        as: 'assignment',
        where: { class_id: classId, is_active: true },
        required: true
      }],
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

    const mappedAssignments = assignments.map(sa => {
      const latestAttempt = attempts.find(at => at.assignment_id === sa.assignment_id);
      return {
        studentAssignmentId: sa.id,
        assignmentId: sa.assignment_id,
        title: sa.assignment?.title,
        instructions: sa.assignment?.instructions,
        startTime: sa.assignment?.start_time,
        endTime: sa.assignment?.end_time,
        maxAttempts: sa.assignment?.max_attempts || 1,
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

    const openCount = mappedAssignments.filter(a => a.status === 'open').length;
    const upcomingCnt = mappedAssignments.filter(a => a.status === 'upcoming').length;
    const completedCount = mappedAssignments.filter(a => a.status === 'submitted').length;

    return {
      classInfo: {
        classId: cls.id,
        className: cls.name,
        classCode: cls.class_code,
        courseName: cls.course?.name,
        teacherName: cls.teacher?.full_name,
        semester: cls.semester,
        academicYear: cls.academic_year
      },
      stats: {
        totalAssignments: mappedAssignments.length,
        completedAssignments: completedCount,
        openAssignments: openCount,
        upcomingAssignments: upcomingCnt,
        averageScore: 0
      },
      assignments: mappedAssignments
    };
  }

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

  async joinClass(studentId, classCode) {
    // Find class by code
    const cls = await Class.findOne({
      where: { class_code: classCode, is_active: true }
    });

    if (!cls) {
      throw new Error('Mã lớp không hợp lệ hoặc lớp đã bị đóng');
    }

    // Check if already a member
    const existingMember = await ClassMember.findOne({
      where: { user_id: studentId, class_id: cls.id }
    });

    if (existingMember) {
      if (existingMember.role === 'student') {
        throw new Error('Bạn đã tham gia lớp này rồi');
      }
      throw new Error('Bạn không phải là học sinh trong lớp này');
    }

    // Add as student member
    const member = await ClassMember.create({
      user_id: studentId,
      class_id: cls.id,
      role: 'student',
      joined_at: new Date()
    });

    // Get class info for response
    const classInfo = await Class.findByPk(cls.id, {
      include: [
        { model: User, as: 'teacher', attributes: ['full_name'] },
        { model: Course, as: 'course', attributes: ['name'] }
      ]
    });

    // Send notification to student about joining class
    if (classInfo) {
      await this.sendNotification(studentId, {
        type: 'system',
        title: 'Tham gia lớp thành công',
        content: `Bạn đã tham gia lớp ${classInfo.name || cls.name}${classInfo.course?.name ? ` - ${classInfo.course.name}` : ''}`,
        metadata: {
          classId: cls.id,
          className: classInfo.name || cls.name,
          courseName: classInfo.course?.name || null,
          action_url: `/student/classes/${cls.id}`,
        },
      });
    }

    return {
      success: true,
      message: 'Tham gia lớp thành công',
      member: {
        id: member.id,
        classId: cls.id,
        className: cls.name,
        classCode: cls.class_code,
        courseName: classInfo?.course?.name,
        teacherName: classInfo?.teacher?.full_name
      }
    };
  }
}

export default new ClassService();
