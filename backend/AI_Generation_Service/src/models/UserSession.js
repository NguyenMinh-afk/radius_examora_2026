
/**
 * Model lưu thông tin phiên đăng nhập của người dùng
 * @module models/UserSession
 */
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/sequelize');

/**
 * @class UserSession
 * @property {UUID} id - Mã phiên
 * @property {UUID} user_id - Mã người dùng
 * @property {string} session_token - Token phiên
 * @property {string} refresh_token - Token làm mới
 * @property {string} device_type - Loại thiết bị
 * @property {string} user_agent - User agent
 * @property {string} ip_address - Địa chỉ IP
 * @property {boolean} is_active - Phiên còn hiệu lực
 * @property {Date} expires_at - Thời gian hết hạn
 * @property {Date} last_activity - Thời gian hoạt động cuối
 */
class UserSession extends Model {}

UserSession.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  session_token: DataTypes.STRING, // Token phiên
  refresh_token: DataTypes.STRING, // Token làm mới
  device_type: DataTypes.STRING, // Loại thiết bị
  user_agent: DataTypes.STRING, // User agent
  ip_address: DataTypes.STRING, // Địa chỉ IP
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  expires_at: DataTypes.DATE, // Hết hạn
  last_activity: DataTypes.DATE, // Hoạt động cuối
}, {
  sequelize,
  modelName: 'UserSession',
  tableName: 'user_sessions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = UserSession;
