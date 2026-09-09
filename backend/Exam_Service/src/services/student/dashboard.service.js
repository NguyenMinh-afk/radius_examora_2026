/**
 * Student Dashboard Service
 */
import { Op } from 'sequelize';
import sequelize from '../../config/sequelize.js';
import {
  User,
  UserProfile,
  Class,
  ClassMember,
  ExamAssignment,
  StudentAssignment,
  Attempt,
  Course
} from '../../models/index.js';

class DashboardService {

  async getDashboard(studentId) {
    const now = new Date();

    const student = await User.findByPk(studentId, {
      attributes: ['id', 'email', 'full_name', 'avatar_url', 'phone'],
      include: [{
        model: UserProfile,
        as: 'profile',
        attributes: ['student_code', 'date_of_birth', 'gender', 'school_name']
      }]
    });

    if (!student) {
      throw new Error('Student not found');
    }

    const classCount = await ClassMember.count({
      where: { user_id: studentId, role: 'student' }
    });

    const openAssignments = await StudentAssignment.count({
      where: { student_id: studentId },
      include: [{
        model: ExamAssignment,
        as: 'assignment',
        where: {
          is_active: true,
          start_time: { [Op.lte]: now },
          end_time: { [Op.gte]: now }
        },
        required: true
      }]
    });

    const upcomingCount = await StudentAssignment.count({
      where: { student_id: studentId },
      include: [{
        model: ExamAssignment,
        as: 'assignment',
        where: {
          is_active: true,
          start_time: { [Op.gt]: now }
        },
        required: true
      }]
    });

    const avgScoreResult = await Attempt.findOne({
      where: {
        student_id: studentId,
        status: { [Op.in]: ['submitted', 'graded'] }
      },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('score')), 'avgScore']
      ],
      raw: true
    });
    const averageScore = avgScoreResult?.avgScore
      ? parseFloat(parseFloat(avgScoreResult.avgScore).toFixed(1))
      : 0;

    const nextAssignment = await ExamAssignment.findOne({
      where: {
        is_active: true,
        start_time: { [Op.gt]: now }
      },
      include: [{
        model: StudentAssignment,
        as: 'studentAssignments',
        where: { student_id: studentId },
        required: true
      }, {
        model: Class,
        as: 'class',
        include: [{ model: User, as: 'teacher', attributes: ['full_name'] }]
      }],
      order: [['start_time', 'ASC']],
      limit: 1
    });

    const myClasses = await ClassMember.findAll({
      where: { user_id: studentId, role: 'student' },
      include: [{
        model: Class,
        as: 'class',
        include: [
          { model: User, as: 'teacher', attributes: ['full_name'] },
          { model: Course, as: 'course', attributes: ['name'] }
        ]
      }],
      limit: 4
    });

    const recentResults = await Attempt.findAll({
      where: {
        student_id: studentId,
        status: { [Op.in]: ['submitted', 'graded'] }
      },
      include: [{
        model: ExamAssignment,
        as: 'assignment',
        attributes: ['title']
      }, {
        model: Class,
        as: 'class',
        attributes: ['name']
      }],
      order: [['submitted_at', 'DESC']],
      limit: 5
    });

    return {
      student: {
        id: student.id,
        fullName: student.full_name,
        email: student.email,
        avatarUrl: student.avatar_url,
        phone: student.phone,
        studentCode: student.profile?.student_code,
        dateOfBirth: student.profile?.date_of_birth,
        gender: student.profile?.gender,
        schoolName: student.profile?.school_name
      },
      overview: {
        classCount,
        upcomingAssignments: upcomingCount,
        openAssignments,
        averageScore
      },
      nextAssignment: nextAssignment ? {
        assignmentId: nextAssignment.id,
        title: nextAssignment.title,
        className: nextAssignment.class?.name,
        startTime: nextAssignment.start_time,
        endTime: nextAssignment.end_time,
        status: 'upcoming'
      } : null,
      myClasses: myClasses.map(cm => ({
        classId: cm.class?.id,
        className: cm.class?.name,
        classCode: cm.class?.class_code,
        courseName: cm.class?.course?.name,
        teacherName: cm.class?.teacher?.full_name
      })),
      recentResults: recentResults.map(r => ({
        attemptId: r.id,
        assignmentId: r.assignment_id,
        title: r.assignment?.title,
        className: r.class?.name,
        score: r.score ? parseFloat(r.score) : null,
        percentage: r.percentage ? parseFloat(r.percentage) : null,
        submittedAt: r.submitted_at
      }))
    };
  }
}

export default new DashboardService();
