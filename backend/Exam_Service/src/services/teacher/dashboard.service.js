/**
 * Teacher Dashboard Service
 */
import { Op } from 'sequelize';
import sequelize from '../../config/sequelize.js';
import {
  User,
  UserProfile,
  Class,
  ClassMember,
  Exam,
  ExamAssignment,
  Attempt,
  Course
} from '../../models/index.js';

class DashboardService {
  deriveAssignmentStatus(assignment) {
    const now = new Date();
    const startTime = new Date(assignment.start_time);
    const endTime = new Date(assignment.end_time);

    if (!assignment.is_active) return 'closed';
    if (now > endTime) return 'closed';
    if (now < startTime) return 'upcoming';
    return 'open';
  }

  async getDashboard(teacherId) {
    const now = new Date();

    const teacher = await User.findByPk(teacherId, {
      attributes: ['id', 'email', 'full_name', 'avatar_url'],
      include: [{ model: UserProfile, as: 'profile' }]
    });

    if (!teacher) {
      throw new Error('Teacher not found');
    }

    // Overview counts
    const classCount = await Class.count({
      where: { teacher_id: teacherId, is_active: true }
    });

    const classIds = (await Class.findAll({
      where: { teacher_id: teacherId, is_active: true },
      attributes: ['id']
    })).map(c => c.id);

    let studentCount = 0;
    let examCount = 0;
    let assignmentCount = 0;
    let openAssignments = 0;
    let pendingGrades = 0;

    if (classIds.length > 0) {
      studentCount = await ClassMember.count({
        where: { class_id: { [Op.in]: classIds }, role: 'student' }
      });

      examCount = await Exam.count({
        where: { created_by: teacherId }
      });

      assignmentCount = await ExamAssignment.count({
        where: { assigned_by: teacherId, is_active: true }
      });

      const openAssignmentsList = await ExamAssignment.findAll({
        where: {
          assigned_by: teacherId,
          is_active: true,
          start_time: { [Op.lte]: now },
          end_time: { [Op.gte]: now }
        }
      });
      openAssignments = openAssignmentsList.length;

      // Pending grades: submitted but not graded
      const submittedAttempts = await Attempt.findAll({
        where: {
          status: 'submitted',
          assignment_id: {
            [Op.in]: (await ExamAssignment.findAll({
              where: { assigned_by: teacherId },
              attributes: ['id']
            })).map(a => a.id)
          }
        }
      });
      pendingGrades = submittedAttempts.length;
    }

    // Upcoming Assignments
    const upcomingAssignments = await ExamAssignment.findAll({
      where: {
        assigned_by: teacherId,
        is_active: true,
        start_time: { [Op.gte]: now }
      },
      include: [
        { model: Class, as: 'class', attributes: ['name', 'class_code'] },
        { model: Exam, as: 'exam', attributes: ['title'] }
      ],
      order: [['start_time', 'ASC']],
      limit: 5
    });

    // Recent Results
    const recentAttempts = await Attempt.findAll({
      where: {
        status: { [Op.in]: ['submitted', 'graded'] },
        assignment_id: {
          [Op.in]: (await ExamAssignment.findAll({
            where: { assigned_by: teacherId },
            attributes: ['id']
          })).map(a => a.id)
        }
      },
      include: [
        { model: User, as: 'student', attributes: ['full_name'] },
        { model: ExamAssignment, as: 'assignment', attributes: ['title', 'class_id'], include: [{ model: Class, as: 'class', attributes: ['name'] }] }
      ],
      order: [['submitted_at', 'DESC']],
      limit: 5
    });

    // My Classes
    const myClasses = await Class.findAll({
      where: { teacher_id: teacherId, is_active: true },
      include: [
        { model: Course, as: 'course', attributes: ['name'] },
        { model: User, as: 'teacher', attributes: ['full_name'] }
      ],
      limit: 4
    });

    const classDetails = [];
    for (const cls of myClasses) {
      const studentCountInClass = await ClassMember.count({
        where: { class_id: cls.id, role: 'student' }
      });
      const assignmentCountInClass = await ExamAssignment.count({
        where: { class_id: cls.id, is_active: true }
      });
      const avgResult = await Attempt.findOne({
        where: { assignment_id: { [Op.in]: (await ExamAssignment.findAll({ where: { class_id: cls.id }, attributes: ['id'] })).map(a => a.id) } },
        attributes: [[sequelize.fn('AVG', sequelize.col('score')), 'avgScore']],
        raw: true
      });
      classDetails.push({
        classId: cls.id,
        className: cls.name,
        classCode: cls.class_code,
        courseName: cls.course?.name || '',
        semester: cls.semester || '',
        academicYear: cls.academic_year || '',
        studentCount: studentCountInClass,
        assignmentCount: assignmentCountInClass,
        averageScore: avgResult?.avgScore ? parseFloat(parseFloat(avgResult.avgScore).toFixed(1)) : 0
      });
    }

    // Notifications (placeholder - notification nằm ở Notification_Service)
    const notificationCount = pendingGrades;

    return {
      teacher: {
        id: teacher.id,
        fullName: teacher.full_name,
        email: teacher.email,
        avatarUrl: teacher.avatar_url,
        teacherCode: teacher.profile?.teacher_code || null,
        department: teacher.profile?.teacher_department || null,
        specialization: teacher.profile?.teacher_specialization || null
      },
      overview: {
        classCount,
        studentCount,
        examCount,
        assignmentCount,
        openAssignments,
        pendingGrades,
        notificationCount
      },
      upcomingAssignments: upcomingAssignments.map(a => ({
        assignmentId: a.id,
        title: a.title,
        examName: a.exam?.title || a.title,
        className: a.class?.name || '',
        startTime: a.start_time,
        endTime: a.end_time,
        studentAssigned: classDetails.find(c => c.classId === a.class_id)?.studentCount || 0,
        submitted: 0,
        status: this.deriveAssignmentStatus(a)
      })),
      recentResults: recentAttempts.map(r => ({
        attemptId: r.attempt_id,
        studentName: r.student?.full_name || 'Unknown',
        className: r.assignment?.class?.name || '',
        examName: r.assignment?.title || '',
        score: r.score ? parseFloat(r.score) : null,
        percentage: r.percentage ? parseFloat(r.percentage) : null,
        submittedAt: r.submitted_at,
        status: r.status
      })),
      myClasses: classDetails,
      notifications: []
    };
  }
}

export default new DashboardService();
