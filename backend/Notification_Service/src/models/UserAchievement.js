
/**
 * Model lưu thành tích của người dùng
 * @module models/UserAchievement
 */
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/sequelize');

/**
 * @class UserAchievement
 * @property {UUID} id - Mã thành tích
 * @property {UUID} user_id - Mã người dùng
 * @property {string} achievement_type - Loại thành tích
 * @property {UUID} achievement_id - Mã thành tích liên kết
 * @property {Date} awarded_at - Ngày nhận
 * @property {object} details - Thông tin chi tiết
 */
class UserAchievement extends Model {}

UserAchievement.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  achievement_type: DataTypes.STRING, // Loại thành tích
  achievement_id: DataTypes.UUID, // Mã thành tích liên kết
  awarded_at: DataTypes.DATE, // Ngày nhận
  details: DataTypes.JSONB, // Thông tin chi tiết
}, {
  sequelize,
  modelName: 'UserAchievement',
  tableName: 'user_achievements',
  timestamps: false,
});

module.exports = UserAchievement;
