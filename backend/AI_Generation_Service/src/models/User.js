/**
 * Model User - thông tin người dùng hệ thống
 * @augments Model
 */
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize.js';

class User extends Model {}

User.init({
  /**
   * UUID của user
   */
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  /**
   * Email đăng nhập
   */
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  /**
   * Số điện thoại
   */
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  /**
   * Hash mật khẩu
   */
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  /**
   * Họ tên đầy đủ
   */
  full_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  /**
   * Đường dẫn ảnh đại diện
   */
  avatar_url: DataTypes.STRING,
  /**
   * Trạng thái hoạt động
   */
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  /**
   * Đã xác thực email chưa
   */
  email_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  /**
   * Trạng thái phê duyệt tài khoản
   */
  approval_status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
  },
  /**
   * Thời gian phê duyệt
   */
  approved_at: DataTypes.DATE,
  /**
   * ID người phê duyệt
   */
  approved_by: DataTypes.UUID,
  /**
   * Ghi chú phê duyệt
   */
  approval_note: DataTypes.STRING,
  /**
   * Lần đăng nhập cuối
   */
  last_login: DataTypes.DATE,
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
});

export default User;