/**
 * Student Service - Business logic cho Student Module
 * ESM - Cung cấp DTO response cho frontend theo đúng schema
 */
import { Op } from 'sequelize';
import sequelize from '../config/sequelize.js';
import {
  User,
  Class,
  ClassMember,
  ClassPost,
  Exam,
  ExamAssignment,
  StudentAssignment,
  Attempt,
  Course
} from '../models/index.js';

class StudentService {

  /**
   * Derive assignment status cho frontend
   * Logic:
   * - submitted: đã có attempt submitted/graded
   * - expired: hết lượt hoặc past end_time
   * - open: current_time giữa start_time và end_time
   * - upcoming: current_time < start_time
   */
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

  async getDashboard(studentId) {
    const now = new Date();

    const student = await User.findByPk(studentId, {
      attributes: ['id', 'email', 'full_name', 'avatar_url']
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
        avatarUrl: student.avatar_url
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

      const completedCount = await StudentAssignment.count({
        where: { student_id: studentId },
        include: [{
          model: Attempt,
          as: 'attempts',
          where: { status: { [Op.in]: ['submitted', 'graded'] } }
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

  async getClassPosts(studentId, classId, filters = {}) {
    // Verify student is a member of the class
    const membership = await ClassMember.findOne({
      where: { class_id: classId, user_id: studentId, role: 'student' }
    });
    if (!membership) {
      throw new Error('You are not a member of this class');
    }

    const { type, search, page = 1, limit = 20 } = filters;
    const offset = (page - 1) * limit;

    const whereClause = { class_id: classId };
    if (type && type !== 'all') {
      whereClause.type = type;
    }
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: posts } = await ClassPost.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'author', attributes: ['full_name', 'avatar_url'] }
      ],
      order: [
        ['is_pinned', 'DESC'],
        ['created_at', 'DESC']
      ],
      limit,
      offset
    });

    const items = posts.map(p => ({
      postId: p.id,
      title: p.title,
      content: p.content,
      type: p.type,
      isPinned: p.is_pinned,
      attachments: p.attachments || [],
      authorName: p.author?.full_name || 'Unknown',
      authorAvatar: p.author?.avatar_url || null,
      createdAt: p.created_at,
      updatedAt: p.updated_at
    }));

    return {
      items,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    };
  }
}

export default new StudentService();
