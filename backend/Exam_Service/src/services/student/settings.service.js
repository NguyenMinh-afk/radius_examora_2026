/**
 * Settings Service - Student settings (profile, notifications, password)
 * ESM - Exam_Service
 */
import bcrypt from 'bcryptjs';
import { User, UserProfile } from '../../models/index.js';
const DEFAULT_NOTIFICATION_SETTINGS = {
  emailNotifications: true,
  examReminders: true,
  deadlineReminders: true,
  gradeNotifications: true,
};
/**
 * Lấy thông tin profile học sinh
 */
export const getProfile = async (userId) => {
    const user = await User.findByPk(userId, {
      attributes: ['id', 'email', 'full_name', 'avatar_url', 'phone'],
      include: [{
        model: UserProfile,
        as: 'profile',
        attributes: ['student_code', 'date_of_birth', 'gender', 'school_name'],
      }],
    });
    if (!user) {
      const error = new Error('Không tìm thấy người dùng');
      error.status = 404;
      throw error;
    }

    return {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        avatarUrl: user.avatar_url,
        phone: user.phone || null,
        studentCode: user.profile?.student_code || null,
        dateOfBirth: user.profile?.date_of_birth || null,
        gender: user.profile?.gender || null,
        schoolName: user.profile?.school_name || null,
      };
    };

    /**
 * Cập nhật thông tin profile học sinh
 */
export const updateProfile = async (userId, data) => {
    const user = await User.findByPk(userId);
    if (!user) {
      const error = new Error('Không tìm thấy người dùng');
      error.status = 404;
      throw error;
    }
     // Update user fields
  if (data.fullName) {
    user.full_name = data.fullName;
  }
  if (data.phone !== undefined) {
    user.phone = data.phone || null;
  }
  await user.save();
  // Update profile
  let profile = await UserProfile.findOne({ where: { user_id: userId } });
  if (!profile) {
    profile = await UserProfile.create({ user_id: userId });
  }
  if (data.dateOfBirth !== undefined) profile.date_of_birth = data.dateOfBirth || null;
  if (data.gender !== undefined) profile.gender = data.gender || null;
  await profile.save();
  return getProfile(userId);
};

/**
 * Lấy cài đặt thông báo (mock - có thể mở rộng với bảng riêng)
 */
export const getNotificationSettings = async (userId) => {
    // TODO: Tạo bảng notification_settings nếu cần lưu trữ thực sự
    // Hiện tại trả về mặc định
    return { ...DEFAULT_NOTIFICATION_SETTINGS };
  };

  /**
 * Cập nhật cài đặt thông báo (mock - có thể mở rộng)
 */
export const updateNotificationSettings = async (userId, settings) => {
    // TODO: Lưu vào bảng notification_settings
    return {
      emailNotifications: settings.emailNotifications ?? true,
      examReminders: settings.examReminders ?? true,
      deadlineReminders: settings.deadlineReminders ?? true,
      gradeNotifications: settings.gradeNotifications ?? true,
    };
  };

  /**
 * Đổi mật khẩu
 */
export const changePassword = async (userId, currentPassword, newPassword) => {
    const user = await User.findByPk(userId);
    if (!user) {
      const error = new Error('Không tìm thấy người dùng');
      error.status = 404;
      throw error;
    }

     // Verify current password
  const isValid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isValid) {
    const error = new Error('Mật khẩu hiện tại không đúng');
    error.status = 400;
    throw error;
  }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(newPassword, salt);
    await user.save();
    return { success: true, message: 'Đổi mật khẩu thành công' };
  };

  export default {
    getProfile,
    updateProfile,
    getNotificationSettings,
    updateNotificationSettings,
    changePassword,
  };
