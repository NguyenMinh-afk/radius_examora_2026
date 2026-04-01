/**
 * Model UserProfile - thông tin hồ sơ chi tiết của user
 * @augments Model
 */
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/sequelize');

class UserProfile extends Model {}

UserProfile.init({
  /**
   * ID user (khóa chính, liên kết User)
   */
  user_id: {
    type: DataTypes.UUID,
    primaryKey: true,
    references: { model: 'users', key: 'id' },
  },
  /** Ngày sinh */
  date_of_birth: DataTypes.DATEONLY,
  /** Giới tính */
  gender: DataTypes.STRING,
  /** Địa chỉ hiện tại */
  address: DataTypes.STRING,
  /** Địa chỉ thường trú */
  permanent_address: DataTypes.STRING,
  /** Thành phố */
  city: DataTypes.STRING,
  /** Quận/huyện */
  district: DataTypes.STRING,
  /** Phường/xã */
  ward: DataTypes.STRING,
  /** Tên trường học */
  school_name: DataTypes.STRING,
  /** Khối/lớp */
  grade_level: DataTypes.STRING,
  /** Mã học sinh */
  student_code: DataTypes.STRING,
  /** Mô tả bản thân */
  bio: DataTypes.STRING,
  /** Tuỳ chọn cá nhân (JSON) */
  preferences: DataTypes.JSONB,
}, {
  sequelize,
  modelName: 'UserProfile',
  tableName: 'user_profiles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = UserProfile;
