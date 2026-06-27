/**
 * Teacher Service - Business logic cho Teacher Module (Exam_Service)
 * ESM - Cung cấp DTO response cho frontend theo đúng Task1.md schema
 */
import { Op } from 'sequelize';
import sequelize from '../config/sequelize.js';
import {
  User,
  UserProfile,
  Class,
  ClassMember,
  ClassPost,
  Exam,
  ExamQuestion,
  ExamAssignment,
  StudentAssignment,
  Attempt,
  Course
} from '../models/index.js';

class TeacherService {

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

  async getCourses(teacherId) {
    const teacherClasses = await Class.findAll({
      where: { teacher_id: teacherId, is_active: true }
    });

    const courseIds = [...new Set(teacherClasses.map(c => c.course_id).filter(Boolean))];

    // Chỉ fetch courses mà teacher có lớp
    const courses = courseIds.length > 0
      ? await Course.findAll({
          where: { id: courseIds },
          attributes: ['id', 'name', 'code', 'description', 'credits']
        })
      : [];

    const result = [];
    for (const course of courses) {
      const classIds = teacherClasses.filter(c => c.course_id === course.id).map(c => c.id);
      const examCount = await Exam.count({
        where: { created_by: teacherId }
      });
      result.push({
        courseId: course.id,
        name: course.name,
        code: course.code,
        description: course.description || '',
        credits: course.credits || 0,
        facultyName: '',
        classCount: classIds.length,
        examCount,
        questionCount: 0
      });
    }

    return result;
  }

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

      // Đếm số assignment đã có attempt (submitted/graded) của sinh viên này
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

  // ============ CLASS POSTS (Thông báo lớp học) ============

  async getClassPosts(teacherId, classId, filters = {}) {
    // Verify teacher owns the class
    const cls = await Class.findOne({
      where: { id: classId, teacher_id: teacherId }
    });
    if (!cls) {
      throw new Error('Class not found or access denied');
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

  async createClassPost(teacherId, classId, data) {
    const cls = await Class.findOne({
      where: { id: classId, teacher_id: teacherId }
    });
    if (!cls) {
      throw new Error('Class not found or access denied');
    }

    const { title, content, type = 'announcement', isPinned = false, attachments = [] } = data;

    if (!content || content.trim() === '') {
      throw new Error('Nội dung không được để trống');
    }

    const post = await ClassPost.create({
      class_id: classId,
      author_id: teacherId,
      title: title || null,
      content: content.trim(),
      type,
      is_pinned: isPinned,
      attachments
    });

    // Gửi notification cho tất cả học sinh trong lớp
    await this.notifyStudents(classId, post);

    return {
      postId: post.id,
      title: post.title,
      content: post.content,
      type: post.type,
      isPinned: post.is_pinned,
      attachments: post.attachments,
      createdAt: post.created_at
    };
  }

  async updateClassPost(teacherId, postId, data) {
    const post = await ClassPost.findByPk(postId);
    if (!post) {
      throw new Error('Post not found');
    }

    // Verify teacher owns the class
    const cls = await Class.findOne({
      where: { id: post.class_id, teacher_id: teacherId }
    });
    if (!cls) {
      throw new Error('Access denied');
    }

    const { title, content, type, isPinned, attachments } = data;

    if (title !== undefined) post.title = title;
    if (content !== undefined) post.content = content;
    if (type !== undefined) post.type = type;
    if (isPinned !== undefined) post.is_pinned = isPinned;
    if (attachments !== undefined) post.attachments = attachments;

    await post.save();

    return {
      postId: post.id,
      title: post.title,
      content: post.content,
      type: post.type,
      isPinned: post.is_pinned,
      attachments: post.attachments,
      updatedAt: post.updated_at
    };
  }

  async deleteClassPost(teacherId, postId) {
    const post = await ClassPost.findByPk(postId);
    if (!post) {
      throw new Error('Post not found');
    }

    const cls = await Class.findOne({
      where: { id: post.class_id, teacher_id: teacherId }
    });
    if (!cls) {
      throw new Error('Access denied');
    }

    await post.destroy();
    return { success: true };
  }

  async notifyStudents(classId, post) {
    try {
      // Lấy danh sách học sinh trong lớp
      const members = await ClassMember.findAll({
        where: { class_id: classId, role: 'student' },
        include: [{ model: User, as: 'user', attributes: ['id', 'email'] }]
      });

      if (members.length === 0) return;

      // Gọi Notification Service để gửi thông báo
      const classInfo = await Class.findByPk(classId, { attributes: ['name'] });
      const notificationPayloads = members.map(m => ({
        user_id: m.user_id,
        title: `Thông báo mới từ lớp ${classInfo?.name || 'N/A'}`,
        message: post.title || post.content.substring(0, 100),
        type: 'class_post',
        reference_id: post.id,
        reference_type: 'class_post',
        data: {
          classId,
          postId: post.id,
          postType: post.type
        }
      }));

      // Gửi batch notification (call Notification Service API)
      // TODO: Implement khi Notification_Service sẵn sàng
      console.log(`[ClassPost] Would notify ${members.length} students about post ${post.id}`);

      return notificationPayloads;
    } catch (error) {
      console.error('[ClassPost] Failed to notify students:', error);
    }
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

    const now = new Date();
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

  async getProfile(teacherId) {
    const teacher = await User.findByPk(teacherId, {
      attributes: ['id', 'email', 'full_name', 'avatar_url', 'phone', 'created_at'],
      include: [{ model: UserProfile, as: 'profile' }]
    });

    if (!teacher) {
      throw new Error('Teacher not found');
    }

    // Stats
    const classCount = await Class.count({
      where: { teacher_id: teacherId, is_active: true }
    });

    const classIds = (await Class.findAll({
      where: { teacher_id: teacherId, is_active: true },
      attributes: ['id']
    })).map(c => c.id);

    let studentCount = 0;
    if (classIds.length > 0) {
      studentCount = await ClassMember.count({
        where: { class_id: { [Op.in]: classIds }, role: 'student' }
      });
    }

    const examCount = await Exam.count({
      where: { created_by: teacherId }
    });

    const assignmentCount = await ExamAssignment.count({
      where: { assigned_by: teacherId, is_active: true }
    });

    return {
      id: teacher.id,
      fullName: teacher.full_name,
      email: teacher.email,
      phone: teacher.phone || '',
      avatarUrl: teacher.avatar_url,
      teacherCode: teacher.profile?.teacher_code || null,
      department: teacher.profile?.teacher_department || null,
      specialization: teacher.profile?.teacher_specialization || null,
      bio: teacher.profile?.bio || null,
      dateOfBirth: teacher.profile?.date_of_birth || null,
      gender: teacher.profile?.gender || null,
      schoolName: teacher.profile?.school_name || null,
      createdAt: teacher.created_at,
      stats: {
        classCount,
        studentCount,
        examCount,
        assignmentCount
      }
    };
  }

  async updateProfile(teacherId, updateData) {
    const { fullName, phone, avatarUrl, bio, dateOfBirth, gender, schoolName, teacherCode, department, specialization } = updateData;

    // Update User table
    if (fullName !== undefined || phone !== undefined || avatarUrl !== undefined) {
      const userUpdate = {};
      if (fullName !== undefined) userUpdate.full_name = fullName;
      if (phone !== undefined) userUpdate.phone = phone;
      if (avatarUrl !== undefined) userUpdate.avatar_url = avatarUrl;

      await User.update(userUpdate, { where: { id: teacherId } });
    }

    // Update UserProfile table
    let profile = await UserProfile.findOne({ where: { user_id: teacherId } });

    if (!profile) {
      // Create profile if doesn't exist
      profile = await UserProfile.create({
        user_id: teacherId,
        bio: bio || null,
        date_of_birth: dateOfBirth || null,
        gender: gender || null,
        school_name: schoolName || null,
        teacher_code: teacherCode || null,
        teacher_department: department || null,
        teacher_specialization: specialization || null,
      });
    } else {
      const profileUpdate = {};
      if (bio !== undefined) profileUpdate.bio = bio;
      if (dateOfBirth !== undefined) profileUpdate.date_of_birth = dateOfBirth;
      if (gender !== undefined) profileUpdate.gender = gender;
      if (schoolName !== undefined) profileUpdate.school_name = schoolName;
      if (teacherCode !== undefined) profileUpdate.teacher_code = teacherCode;
      if (department !== undefined) profileUpdate.teacher_department = department;
      if (specialization !== undefined) profileUpdate.teacher_specialization = specialization;

      if (Object.keys(profileUpdate).length > 0) {
        await UserProfile.update(profileUpdate, { where: { user_id: teacherId } });
      }
    }

    // Return updated profile
    return this.getProfile(teacherId);
  }

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

  // ============== Course CRUD ==============

  async createCourse(teacherId, data) {
    const { name, code, description, credits, semesterType } = data;

    // Check if code already exists
    const existing = await Course.findOne({ where: { code } });
    if (existing) {
      throw new Error('Mã khóa học đã tồn tại');
    }

    const course = await Course.create({
      name,
      code,
      description: description || null,
      credits: credits || 0,
      semester_type: semesterType || null,
      faculty_id: 1  // TODO: cần chọn khoa thực tế từ teacher profile
    });

    return {
      courseId: course.id,
      name: course.name,
      code: course.code,
      description: course.description || '',
      credits: course.credits || 0,
      facultyName: '',
      classCount: 0,
      examCount: 0,
      questionCount: 0
    };
  }

  async updateCourse(teacherId, courseId, data) {
    const course = await Course.findByPk(courseId);
    if (!course) {
      throw new Error('Khóa học không tìm thấy');
    }

    // Check if code is taken by another course
    if (data.code && data.code !== course.code) {
      const existing = await Course.findOne({ where: { code: data.code } });
      if (existing) {
        throw new Error('Mã khóa học đã tồn tại');
      }
    }

    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.code !== undefined) updateData.code = data.code;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.credits !== undefined) updateData.credits = data.credits;
    if (data.semesterType !== undefined) updateData.semester_type = data.semesterType;

    if (Object.keys(updateData).length > 0) {
      await course.update(updateData);
    }

    return {
      courseId: course.id,
      name: course.name,
      code: course.code,
      description: course.description || '',
      credits: course.credits || 0,
      facultyName: '',
      classCount: 0,
      examCount: 0,
      questionCount: 0
    };
  }

  async deleteCourse(teacherId, courseId) {
    const course = await Course.findByPk(courseId);
    if (!course) {
      throw new Error('Khóa học không tìm thấy');
    }

    // Check if course has any classes
    const classCount = await Class.count({ where: { course_id: courseId } });
    if (classCount > 0) {
      throw new Error('Không thể xóa khóa học đã có lớp học');
    }

    await course.destroy();
    return { success: true };
  }

  async getCourseDetail(teacherId, courseId) {
    const course = await Course.findByPk(courseId);
    if (!course) {
      throw new Error('Khóa học không tìm thấy');
    }

    // Get classes for this course
    const classes = await Class.findAll({
      where: { course_id: courseId, teacher_id: teacherId, is_active: true }
    });

    // Get exams for this teacher (filter by course later)
    const examCount = await Exam.count({ where: { created_by: teacherId } });

    return {
      courseId: course.id,
      name: course.name,
      code: course.code,
      description: course.description || '',
      credits: course.credits || 0,
      semesterType: course.semester_type,
      facultyName: '',
      classCount: classes.length,
      examCount,
      questionCount: 0,
      classes: classes.map(c => ({
        classId: c.id,
        name: c.name,
        studentCount: 0
      }))
    };
  }

  // ============== Class CRUD ==============

  async createClass(teacherId, data) {
    const { name, classCode, courseId, yearLevel, academicYear, semester } = data;

    // Check if class code already exists
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

    // Fetch course info if available
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

    // Check if class code is taken by another class
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

    // Fetch course info if available
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

    // Check if class has students
    const studentCount = await ClassMember.count({
      where: { class_id: classId, role: 'student' }
    });
    if (studentCount > 0) {
      throw new Error('Không thể xóa lớp đã có sinh viên');
    }

    // Soft delete - set is_active to false
    await cls.update({ is_active: false });

    return { success: true };
  }

  // ============== Exam CRUD ==============

  async getExams(teacherId, filters = {}) {
    const where = { created_by: teacherId };

    if (filters.search) {
      where.title = { [Op.like]: `%${filters.search}%` };
    }

    const exams = await Exam.findAll({
      where,
      order: [['created_at', 'DESC']]
    });

    const result = [];
    for (const exam of exams) {
      // Count questions
      const questionCount = await ExamQuestion.count({
        where: { exam_id: exam.id }
      });

      result.push({
        examId: exam.id,
        title: exam.title,
        courseId: null,
        courseName: '',
        questionCount,
        duration: 0,
        totalPoints: 0,
        passingScore: 0,
        published: exam.is_public,
        createdAt: exam.created_at?.toISOString() || ''
      });
    }

    return result;
  }

  async getExamDetail(teacherId, examId) {
    const exam = await Exam.findOne({
      where: { id: examId, created_by: teacherId }
    });
    if (!exam) {
      throw new Error('Đề thi không tìm thấy');
    }

    // Get questions
    const examQuestions = await ExamQuestion.findAll({
      where: { exam_id: examId },
      order: [['question_order', 'ASC']]
    });

    return {
      examId: exam.id,
      title: exam.title,
      description: exam.description || '',
      courseId: null,
      courseName: '',
      questionCount: examQuestions.length,
      duration: 0,
      totalPoints: 0,
      passingScore: 0,
      published: exam.is_public,
      createdAt: exam.created_at?.toISOString() || '',
      questions: examQuestions.map(eq => ({
        questionId: eq.question_id,
        order: eq.question_order,
        score: eq.points
      }))
    };
  }

  async createExam(teacherId, data) {
    const { title, description } = data;

    const exam = await Exam.create({
      title: title,
      description: description || null,
      created_by: teacherId,
      course_id: 0,
      duration: 60,
      total_points: 100,
      is_public: false // Default to draft
    });

    return {
      examId: exam.id,
      title: exam.title,
      courseId: exam.course_id,
      courseName: '',
      questionCount: 0,
      duration: exam.duration || 60,
      totalPoints: parseFloat(exam.total_points) || 100,
      passingScore: parseFloat(exam.passing_score) || 0,
      published: false,
      createdAt: exam.created_at?.toISOString() || ''
    };
  }

  async updateExam(teacherId, examId, data) {
    const exam = await Exam.findOne({
      where: { id: examId, created_by: teacherId }
    });
    if (!exam) {
      throw new Error('Đề thi không tìm thấy');
    }

    const updateData = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.published !== undefined) updateData.is_public = data.published;

    if (Object.keys(updateData).length > 0) {
      await exam.update(updateData);
    }

    return {
      examId: exam.id,
      title: exam.title,
      description: exam.description || '',
      courseId: null,
      courseName: '',
      questionCount: 0,
      duration: 0,
      totalPoints: 0,
      passingScore: 0,
      published: exam.is_public,
      createdAt: exam.created_at?.toISOString() || ''
    };
  }

  async deleteExam(teacherId, examId) {
    const exam = await Exam.findOne({
      where: { id: examId, created_by: teacherId }
    });
    if (!exam) {
      throw new Error('Đề thi không tìm thấy');
    }

    // Check if exam has been assigned
    const assignmentCount = await ExamAssignment.count({
      where: { exam_id: examId }
    });
    if (assignmentCount > 0) {
      throw new Error('Không thể xóa đề thi đã được giao');
    }

    // Delete exam questions first
    await ExamQuestion.destroy({
      where: { exam_id: examId }
    });

    await exam.destroy();

    return { success: true };
  }

  // ============== Exam Question Management ==============

  async getExamQuestions(teacherId, examId) {
    // Verify ownership
    const exam = await Exam.findOne({
      where: { id: examId, created_by: teacherId }
    });
    if (!exam) {
      throw new Error('Đề thi không tìm thấy');
    }

    const examQuestions = await ExamQuestion.findAll({
      where: { exam_id: examId },
      order: [['question_order', 'ASC']]
    });

    return {
      examId: exam.id,
      title: exam.title,
      questions: examQuestions.map(eq => ({
        id: eq.id,
        questionId: eq.question_id,
        order: eq.question_order,
        points: parseFloat(eq.points) || 1.0,
        timeLimit: eq.time_limit,
        isRequired: eq.is_required
      }))
    };
  }

  async addExamQuestions(teacherId, examId, { questionIds, defaultPoints = 1.0 }) {
    // Verify ownership
    const exam = await Exam.findOne({
      where: { id: examId, created_by: teacherId }
    });
    if (!exam) {
      throw new Error('Đề thi không tìm thấy');
    }

    // Get current max order
    const maxOrderResult = await ExamQuestion.findOne({
      where: { exam_id: examId },
      order: [['question_order', 'DESC']],
      attributes: ['question_order']
    });
    let nextOrder = (maxOrderResult?.question_order || 0) + 1;

    // Add questions
    const newQuestions = questionIds.map(questionId => ({
      exam_id: examId,
      question_id: questionId,
      question_order: nextOrder++,
      points: defaultPoints,
      is_required: true
    }));

    await ExamQuestion.bulkCreate(newQuestions, { ignoreDuplicates: true });

    // Recalculate total points
    const totalPoints = await ExamQuestion.sum('points', { where: { exam_id: examId } });
    await exam.update({ total_points: totalPoints || 0 });

    return {
      success: true,
      addedCount: questionIds.length,
      totalQuestions: await ExamQuestion.count({ where: { exam_id: examId } })
    };
  }

  async updateExamQuestion(teacherId, examId, questionId, data) {
    // Verify ownership
    const exam = await Exam.findOne({
      where: { id: examId, created_by: teacherId }
    });
    if (!exam) {
      throw new Error('Đề thi không tìm thấy');
    }

    const examQuestion = await ExamQuestion.findOne({
      where: { exam_id: examId, question_id: questionId }
    });
    if (!examQuestion) {
      throw new Error('Câu hỏi không tìm thấy trong đề thi');
    }

    const updateData = {};
    if (data.order !== undefined) updateData.question_order = data.order;
    if (data.points !== undefined) updateData.points = data.points;
    if (data.timeLimit !== undefined) updateData.time_limit = data.timeLimit;
    if (data.isRequired !== undefined) updateData.is_required = data.isRequired;

    if (Object.keys(updateData).length > 0) {
      await examQuestion.update(updateData);
    }

    // Recalculate total points
    const totalPoints = await ExamQuestion.sum('points', { where: { exam_id: examId } });
    await exam.update({ total_points: totalPoints || 0 });

    return {
      success: true,
      questionId: questionId,
      order: examQuestion.question_order,
      points: parseFloat(examQuestion.points) || 1.0
    };
  }

  async removeExamQuestion(teacherId, examId, questionId) {
    // Verify ownership
    const exam = await Exam.findOne({
      where: { id: examId, created_by: teacherId }
    });
    if (!exam) {
      throw new Error('Đề thi không tìm thấy');
    }

    const deleted = await ExamQuestion.destroy({
      where: { exam_id: examId, question_id: questionId }
    });
    if (deleted === 0) {
      throw new Error('Câu hỏi không tìm thấy trong đề thi');
    }

    // Recalculate total points
    const totalPoints = await ExamQuestion.sum('points', { where: { exam_id: examId } });
    await exam.update({ total_points: totalPoints || 0 });

    // Reorder remaining questions
    const remaining = await ExamQuestion.findAll({
      where: { exam_id: examId },
      order: [['question_order', 'ASC']]
    });
    for (let i = 0; i < remaining.length; i++) {
      await remaining[i].update({ question_order: i + 1 });
    }

    return { success: true };
  }
}

export default new TeacherService();
