
/**
 * Model lưu thông tin thành tích hệ thống
 * @module models/Achievement
 */
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/sequelize');

/**
 * @class Achievement
 * @property {UUID} id - Mã thành tích
 * @property {string} name - Tên thành tích
 * @property {string} description - Mô tả
 * @property {string} icon_url - Đường dẫn icon
 * @property {Date} created_at - Ngày tạo
 */
class Achievement extends Model {}

Achievement.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: DataTypes.STRING, // Tên thành tích
  description: DataTypes.TEXT, // Mô tả
  icon_url: DataTypes.STRING, // Đường dẫn icon
  created_at: DataTypes.DATE, // Ngày tạo
}, {
  sequelize,
  modelName: 'Achievement',
  tableName: 'achievements',
  timestamps: false,
});

module.exports = Achievement;
