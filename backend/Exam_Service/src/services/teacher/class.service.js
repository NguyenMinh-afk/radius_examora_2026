/**
 * Teacher Class Service
 */
import { Op } from 'sequelize';
import sequelize from '../../config/sequelize.js';
import {
  User,
  UserProfile,
  Class,
  ClassMember,
  ExamAssignment,
  Exam,
  Attempt,
  Course
} from '../../models/index.js';

class ClassService {

  async getClasses(teacherId) {
    const classes = await Class.findAll({
      where: { teacher_id: teacherId, is_active: true },
      include: [
        { model: Course, as: 'course', attributes: ['name'] },
        { model: User, as: 'teacher', attributes: ['full_name'] }
      ]
    });

    const result = [];
    for (const cls of classes) {
      const studentCount = await ClassMember.count({
        where: { class_id: cls.id, role: 'student' }
      });

      const assignmentCount = await ExamAssignment.count({
        where: { class_id: cls.id, is_active: true }
      });

      const now = new Date();
      const openAssignments = await ExamAssignment.count({
        where: {
          class_id: cls.id,
          is_active: true,
          start_time: { [Op.lte]: now },
          end_time: { [Op.gte]: now }
        }
      });

      const assignmentIds = (await ExamAssignment.findAll({
        where: { class_id: cls.id },
        attributes: ['id']
      })).map(a => a.id);

      let averageScore = 0;
      if (assignmentIds.length > 0) {
        const avgResult = await Attempt.findOne({
          where: {
            assignment_id: { [Op.in]: assignmentIds },
            status: { [Op.in]: ['submitted', 'graded'] }
          },
          attributes: [[sequelize.fn('AVG', sequelize.col('score')), 'avgScore']],
          raw: true
        });
        averageScore = avgResult?.avgScore ? parseFloat(parseFloat(avgResult.avgScore).toFixed(1)) : 0;
      }

      result.push({
        classId: cls.id,
        className: cls.name,
        classCode: cls.class_code,
        courseId: cls.course_id,
        courseName: cls.course?.name || '',
        semester: cls.semester || '',
        academicYear: cls.academic_year || '',
        studentCount,
        assignmentCount,
        openAssignments,
        averageScore,
        teacherName: cls.teacher?.full_name || '',
        isActive: cls.is_active,
        createdAt: cls.created_at
      });
    }

    return result;
  }

  async getClassDetail(teacherId, classId) {
    const cls = await Class.findOne({
      where: { id: classId, teacher_id: teacherId },
      include: [
        { model: Course, as: 'course', attributes: ['name'] },
        { model: User, as: 'teacher', attributes: ['full_name'] }
      ]
    });

    if (!cls) {
      throw new Error('Class not found or access denied');
    }

    // Students
    const members = await ClassMember.findAll({
      where: { class_id: classId, role: 'student' },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['full_name', 'email', 'avatar_url'],
          include: [{ model: UserProfile, as: 'profile' }]
        }
      ]
    });

    const assignmentIds = (await ExamAssignment.findAll({
      where: { class_id: classId },
      attributes: ['id']
    })).map(a => a.id);

    const students = [];
    for (const member of members) {
      let avgScore = null;
      if (assignmentIds.length > 0) {
        const avgResult = await Attempt.findOne({
          where: {
            student_id: member.user_id,
            assignment_id: { [Op.in]: assignmentIds },
            status: { [Op.in]: ['submitted', 'graded'] }
          },
          attributes: [[sequelize.fn('AVG', sequelize.col('score')), 'avgScore']],
          raw: true
        });
        avgScore = avgResult?.avgScore ? parseFloat(parseFloat(avgResult.avgScore).toFixed(1)) : null;
      }

      let completedCount = 0;
      if (assignmentIds.length > 0) {
        const attemptCount = await Attempt.count({
          where: {
            student_id: member.user_id,
            assignment_id: { [Op.in]: assignmentIds },
            status: { [Op.in]: ['submitted', 'graded'] }
          }
        });
        completedCount = attemptCount;
      }

      students.push({
        userId: member.user_id,
        fullName: member.user?.full_name || 'Unknown',
        email: member.user?.email || '',
        studentCode: member.user?.profile?.student_code || '',
        avatarUrl: member.user?.avatar_url || null,
        joinedAt: member.joined_at,
        completedAssignments: completedCount,
        averageScore: avgScore
      });
    }

    // Assignments
    const assignments = await ExamAssignment.findAll({
      where: { class_id: classId, is_active: true },
      include: [{ model: Exam, as: 'exam', attributes: ['title'] }],
      order: [['start_time', 'DESC']]
    });

    const classAssignments = [];
    for (const a of assignments) {
      const submittedCount = await Attempt.count({
        where: { assignment_id: a.id }
      });
      const gradedCount = await Attempt.count({
        where: { assignment_id: a.id, status: 'graded' }
      });
      classAssignments.push({
        assignmentId: a.id,
        title: a.title,
        examName: a.exam?.title || a.title,
        startTime: a.start_time,
        endTime: a.end_time,
        maxAttempts: a.max_attempts,
        submittedCount,
        gradedCount,
        status: this.deriveAssignmentStatus(a)
      });
    }

    // Recent Results
    let recentResults = [];
    if (assignmentIds.length > 0) {
      const attempts = await Attempt.findAll({
        where: {
          assignment_id: { [Op.in]: assignmentIds },
          status: { [Op.in]: ['submitted', 'graded'] }
        },
        include: [
          { model: User, as: 'student', attributes: ['full_name'] },
          { model: ExamAssignment, as: 'assignment', attributes: ['title'] }
        ],
        order: [['submitted_at', 'DESC']],
        limit: 10
      });
      recentResults = attempts.map(r => ({
        attemptId: r.attempt_id,
        studentName: r.student?.full_name || 'Unknown',
        className: cls.name,
        examName: r.assignment?.title || '',
        score: r.score ? parseFloat(r.score) : null,
        percentage: r.percentage ? parseFloat(r.percentage) : null,
        submittedAt: r.submitted_at,
        status: r.status
      }));
    }

    return {
      classInfo: {
        classId: cls.id,
        className: cls.name,
        classCode: cls.class_code,
        courseId: cls.course_id,
        courseName: cls.course?.name || '',
        semester: cls.semester || '',
        academicYear: cls.academic_year || '',
        studentCount: students.length,
        assignmentCount: classAssignments.length,
        openAssignments: classAssignments.filter(a => a.status === 'open').length,
        averageScore: 0,
        teacherName: cls.teacher?.full_name || '',
        isActive: cls.is_active,
        createdAt: cls.created_at
      },
      students,
      assignments: classAssignments,
      recentResults
    };
  }

  deriveAssignmentStatus(assignment) {
    const now = new Date();
    const startTime = new Date(assignment.start_time);
    const endTime = new Date(assignment.end_time);

    if (!assignment.is_active) return 'closed';
    if (now > endTime) return 'closed';
    if (now < startTime) return 'upcoming';
    return 'open';
  }

  async createClass(teacherId, data) {
    const { name, classCode, courseId, yearLevel, academicYear, semester } = data;

    const existing = await Class.findOne({ where: { class_code: classCode } });
    if (existing) {
      throw new Error('Mã lớp đã tồn tại');
    }

    const newClass = await Class.create({
      teacher_id: teacherId,
      name,
      class_code: classCode,
      course_id: courseId || null,
      year_level: yearLevel || null,
      academic_year: academicYear || null,
      semester: semester || null,
      is_active: true
    });

    let courseName = '';
    if (newClass.course_id) {
      const course = await Course.findByPk(newClass.course_id);
      courseName = course?.name || '';
    }

    return {
      classId: newClass.id,
      className: newClass.name,
      classCode: newClass.class_code,
      courseId: newClass.course_id,
      courseName,
      semester: newClass.semester || '',
      academicYear: newClass.academic_year || '',
      studentCount: 0,
      assignmentCount: 0,
      openAssignments: 0,
      averageScore: 0,
      teacherName: '',
      isActive: true,
      createdAt: newClass.created_at?.toISOString() || new Date().toISOString()
    };
  }

  async updateClass(teacherId, classId, data) {
    const cls = await Class.findOne({ where: { id: classId, teacher_id: teacherId } });
    if (!cls) {
      throw new Error('Lớp học không tìm thấy');
    }

    if (data.classCode && data.classCode !== cls.class_code) {
      const existing = await Class.findOne({ where: { class_code: data.classCode } });
      if (existing) {
        throw new Error('Mã lớp đã tồn tại');
      }
    }

    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.classCode !== undefined) updateData.class_code = data.classCode;
    if (data.courseId !== undefined) updateData.course_id = data.courseId;
    if (data.yearLevel !== undefined) updateData.year_level = data.yearLevel;
    if (data.academicYear !== undefined) updateData.academic_year = data.academicYear;
    if (data.semester !== undefined) updateData.semester = data.semester;
    if (data.isActive !== undefined) updateData.is_active = data.isActive;

    if (Object.keys(updateData).length > 0) {
      await cls.update(updateData);
    }

    let courseName = '';
    if (cls.course_id) {
      const course = await Course.findByPk(cls.course_id);
      courseName = course?.name || '';
    }

    const studentCount = await ClassMember.count({
      where: { class_id: cls.id, role: 'student' }
    });
    const assignmentCount = await ExamAssignment.count({
      where: { class_id: cls.id, is_active: true }
    });

    return {
      classId: cls.id,
      className: cls.name,
      classCode: cls.class_code,
      courseId: cls.course_id,
      courseName,
      semester: cls.semester || '',
      academicYear: cls.academic_year || '',
      studentCount,
      assignmentCount,
      openAssignments: 0,
      averageScore: 0,
      teacherName: '',
      isActive: cls.is_active,
      createdAt: cls.created_at?.toISOString() || ''
    };
  }

  async deleteClass(teacherId, classId) {
    const cls = await Class.findOne({ where: { id: classId, teacher_id: teacherId } });
    if (!cls) {
      throw new Error('Lớp học không tìm thấy');
    }

    const studentCount = await ClassMember.count({
      where: { class_id: classId, role: 'student' }
    });
    if (studentCount > 0) {
      throw new Error('Không thể xóa lớp đã có sinh viên');
    }

    await cls.update({ is_active: false });

    return { success: true };
  }
}

export default new ClassService();
