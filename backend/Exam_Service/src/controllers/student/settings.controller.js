
/**
 * Settings Service - Student settings (profile, notifications, password)
 * ESM - Exam_Service
 */
import settingsService from '../../services/student/settings.service.js';

/**
 * GET /api/student/settings/profile
 * Lấy thông tin profile học sinh
 */
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await settingsService.getProfile(userId);
    res.json(profile);
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Lỗi server'
    });
  }
};

/**
 * PUT /api/student/settings/profile
 * Cập nhật thông tin profile học sinh
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await settingsService.updateProfile(userId, req.body);
    res.json(profile);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Lỗi server'
    });
  }
};

/**
 * GET /api/student/settings/notifications
 * Lấy cài đặt thông báo
 */
export const getNotificationSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const settings = await settingsService.getNotificationSettings(userId);
    res.json(settings);
  } catch (error) {
    console.error('Error getting notification settings:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Lỗi server'
    });
  }
};

/**
 * PUT /api/student/settings/notifications
 * Cập nhật cài đặt thông báo
 */
export const updateNotificationSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const settings = await settingsService.updateNotificationSettings(userId, req.body);
    res.json(settings);
  } catch (error) {
    console.error('Error updating notification settings:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Lỗi server'
    });
  }
};

/**
 * POST /api/student/settings/change-password
 * Đổi mật khẩu
 */
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Vui lòng nhập đầy đủ mật khẩu'
      });
    }
    const result = await settingsService.changePassword(userId, currentPassword, newPassword);
    res.json(result);
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Lỗi server'
    });
  }
};