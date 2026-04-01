
/**
 * Model lưu vai trò người dùng
 * @module models/Role
 */
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/sequelize');

/**
 * @class Role
 * @property {number} id - Mã vai trò
 * @property {string} name - Tên vai trò
 */
class Role extends Model {}

Role.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
}, {
  sequelize,
  modelName: 'Role',
  tableName: 'roles',
  timestamps: false,
});

module.exports = Role;
