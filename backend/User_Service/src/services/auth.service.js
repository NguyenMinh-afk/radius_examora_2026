const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');
const {
  sequelize,
  User,
  Role,
  UserProfile,
  TeacherProfile,
  StudentProfile,
  UserSession,
} = require('../models');
const { generateTokens, verifyRefreshToken } = require('../config/jwt');
const emailQueue = require('../queue/emailQueue');

const userService = {

  /**
   * ===============================
   * ADMIN – LẤY DS GIÁO VIÊN CHỜ DUYỆT
   * ===============================
   */
  async getPendingAccounts() {
    try {
      const teacherRole = await Role.findOne({
        where: { name: 'teacher' },
      });

      if (!teacherRole) {
        return { error: 'Không tìm thấy role giáo viên', status: 500 };
      }

      const users = await User.findAll({
        where: {
          approval_status: 'pending',
          role_id: teacherRole.id,
        },
        include: [
          {
            model: UserProfile,
            as: 'profile',
            attributes: ['school_name'],
          },
          {
            model: TeacherProfile,
            as: 'teacherProfile',
            attributes: [
              'teaching_experience_years',
              'highest_degree',
              'subjects_teaching',
            ],
          },
        ],
        order: [['created_at', 'DESC']],
      });

      // 🔥 MAP DATA PHẲNG – FRONTEND DÙNG TRỰC TIẾP
      const pendingAccounts = users.map(user => ({
        id: user.id,
        email: user.email,
        phone: user.phone,
        full_name: user.full_name,
        role_name: 'Giáo viên',
        created_at: user.created_at,

        school_name: user.profile?.school_name || null,
        teaching_experience_years:
          user.teacherProfile?.teaching_experience_years || null,
        highest_degree:
          user.teacherProfile?.highest_degree || null,
        subjects_teaching:
          user.teacherProfile?.subjects_teaching || [],
      }));

      return {
        pendingAccounts,
        total: pendingAccounts.length,
      };
    } catch (error) {
      console.error('getPendingAccounts error:', error);
      return { error: error.message, status: 500 };
    }
  },

  /**
   * ===============================
   * REGISTER
   * ===============================
   */
  async registerUser(data) {
    const t = await sequelize.transaction();
    try {
      const {
        email,
        password,
        fullName,
        phone,
        userType,
        gender,
        birthDate,
        schoolName,
        experience,
        studentClass,
        studentSchool,
        studentCode,
      } = data;

      const existingUser = await User.findOne({
        where: { [Op.or]: [{ email }, { phone }] },
        transaction: t,
      });

      if (existingUser) {
        await t.rollback();
        return { error: 'Email hoặc số điện thoại đã được sử dụng' };
      }

      const passwordHash = await bcrypt.hash(
        password,
        parseInt(process.env.BCRYPT_ROUNDS) || 10
      );

      const role = await Role.findOne({
        where: { name: userType },
        transaction: t,
      });

      if (!role) {
        await t.rollback();
        return { error: 'Loại tài khoản không hợp lệ' };
      }

      const approvalStatus = userType === 'student' ? 'approved' : 'pending';

      const user = await User.create(
        {
          email,
          phone,
          password_hash: passwordHash,
          full_name: fullName,
          role_id: role.id,
          is_active: true,
          email_verified: false,
          approval_status: approvalStatus,
          approved_at: approvalStatus === 'approved' ? new Date() : null,
        },
        { transaction: t }
      );

      await UserProfile.create(
        {
          user_id: user.id,
          date_of_birth: birthDate || null,
          gender: gender || null,
          school_name:
            userType === 'teacher'
              ? schoolName || null
              : studentSchool || null,
          grade_level: userType === 'student' ? studentClass : null,
          student_code: userType === 'student' ? studentCode : null,
        },
        { transaction: t }
      );

      if (userType === 'teacher') {
        await TeacherProfile.create(
          {
            user_id: user.id,
            teaching_experience_years:
              experience !== '' && experience !== undefined
                ? Number(experience)
                : null,
          },
          { transaction: t }
        );
      }

      if (userType === 'student') {
        const year = new Date().getFullYear();
        await StudentProfile.create(
          {
            user_id: user.id,
            student_code: studentCode || null,
            current_grade_level: studentClass || null,
            admission_year: year,
            academic_year: `${year}-${year + 1}`,
          },
          { transaction: t }
        );
      }

      await t.commit();

      emailQueue.sendWelcomeEmail({
        email: user.email,
        fullName,
        role: userType,
        userId: user.id,
      }).catch(() => {});

      return { user, approvalStatus };
    } catch (error) {
      await t.rollback();
      return { error: error.message, status: 500 };
    }
  },

  /**
   * ===============================
   * LOGIN
   * ===============================
   */
  async loginUser(data, req) {
    try {
      const { email, password, rememberMe } = data;

      const user = await User.findOne({
        where: {
          [Op.or]: [{ email }, { phone: email }],
        },
        include: [
          { model: Role, as: 'role' },
          { model: UserProfile, as: 'profile' },
          { model: TeacherProfile, as: 'teacherProfile' },
          { model: StudentProfile, as: 'studentProfile' },
        ],
      });

      if (!user)
        return { error: 'Email/số điện thoại hoặc mật khẩu không đúng' };

      if (!user.is_active)
        return { error: 'Tài khoản đã bị vô hiệu hóa', status: 403 };

      if (user.approval_status !== 'approved')
        return {
          error: 'Tài khoản chưa được phê duyệt',
          status: 403,
        };

      const isValid = await bcrypt.compare(password, user.password_hash);
      if (!isValid)
        return { error: 'Email/số điện thoại hoặc mật khẩu không đúng' };

      const tokens = generateTokens({
        id: user.id,
        email: user.email,
        role: user.role.name,
      });

      await UserSession.create({
        user_id: user.id,
        session_token: uuidv4(),
        refresh_token: tokens.refreshToken,
        device_type: 'web',
        user_agent: req.headers['user-agent'] || '',
        ip_address: req.ip,
        expires_at: new Date(
          Date.now() + (rememberMe ? 30 : 7) * 86400000
        ),
      });

      return { user, tokens };
    } catch (error) {
      console.error('loginUser error:', error);
      return { error: error.message, status: 500 };
    }
  },

  /**
   * ===============================
   * REFRESH TOKEN
   * ===============================
   */
  async refreshToken({ refreshToken }) {
    try {
      const decoded = verifyRefreshToken(refreshToken);

      const session = await UserSession.findOne({
        where: {
          refresh_token: refreshToken,
          is_active: true,
          expires_at: { [Op.gt]: new Date() },
        },
      });

      if (!session)
        return { error: 'Refresh token không hợp lệ', status: 401 };

      const user = await User.findByPk(decoded.id, {
        include: [{ model: Role, as: 'role' }],
      });

      if (!user)
        return { error: 'User không tồn tại', status: 401 };

      const tokens = generateTokens({
        id: user.id,
        email: user.email,
        role: user.role.name,
      });

      await session.update({
        refresh_token: tokens.refreshToken,
        last_activity: new Date(),
      });

      return { tokens };
    } catch {
      return { error: 'Refresh token hết hạn', status: 401 };
    }
  },
};

userService.getUsers = async function (query) {
  try {
    const { page = 1, limit = 10, search = '', role, status } = query;
    const where = {};

    if (search) {
      where[Op.or] = [
        { full_name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (role) {
      const roleObj = await Role.findOne({ where: { name: role } });
      if (roleObj) where.role_id = roleObj.id;
    }
    if (status) {
      where.approval_status = status;
    }

    const users = await User.findAndCountAll({
      where,
      include: [
        { model: Role, as: 'role' },
        { model: UserProfile, as: 'profile' },
        { model: TeacherProfile, as: 'teacherProfile' },
        { model: StudentProfile, as: 'studentProfile' },
      ],
      offset: (page - 1) * limit,
      limit: parseInt(limit),
      order: [['created_at', 'DESC']],
    });

    // Map users to include role_name
    const mappedUsers = users.rows.map(user => ({
      ...user.dataValues,
      role_name: user.role ? user.role.name : '',
    }));
    return {
      data: {
        users: mappedUsers,
        pagination: {
          total: users.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(users.count / parseInt(limit)),
        },
      },
    };
  } catch (error) {
    return { error: error.message };
  }
};
module.exports = userService;

/**
 * ===============================
 * ADMIN – LẤY THỐNG KÊ HỆ THỐNG
 * ===============================
 */
userService.getStats = async function () {
  try {
    // Get roles
    const [adminRole, teacherRole, studentRole] = await Promise.all([
      Role.findOne({ where: { name: 'admin' } }),
      Role.findOne({ where: { name: 'teacher' } }),
      Role.findOne({ where: { name: 'student' } }),
    ]);

    // Defensive: If any role is missing, treat as 0
    const teacherRoleId = teacherRole ? teacherRole.id : null;
    const studentRoleId = studentRole ? studentRole.id : null;
    const adminRoleId = adminRole ? adminRole.id : null;

    // Total users (all roles)
    const totalUsers = await User.count();

    // Total teachers (approved only)
    const totalTeachers = teacherRoleId
      ? await User.count({ where: { role_id: teacherRoleId, approval_status: 'approved', is_active: true } })
      : 0;

    // Total students (active only)
    const totalStudents = studentRoleId
      ? await User.count({ where: { role_id: studentRoleId, is_active: true } })
      : 0;

    // Total admins (active only)
    const totalAdmins = adminRoleId
      ? await User.count({ where: { role_id: adminRoleId, is_active: true } })
      : 0;

    // Pending teacher accounts
    const pendingTeachers = teacherRoleId
      ? await User.count({ where: { role_id: teacherRoleId, approval_status: 'pending' } })
      : 0;

    return {
      data: {
        totalUsers,
        totalTeachers,
        totalStudents,
        totalAdmins,
        pendingTeachers,
      },
    };
  } catch (error) {
    return { error: error.message };
  }
};
