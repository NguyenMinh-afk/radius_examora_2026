/**
 * User Model - Cross-schema reference từ user_db
 * ESM - Exam_Service dùng User từ user_db để join thông tin teacher/student
 * Không tự định nghĩa schema, chỉ reference bảng đã tạo ở user_db
 */
import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';

class User extends Model {}

User.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  full_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  avatar_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  email_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  approval_status: {
    type: DataTypes.STRING(20),
    defaultValue: 'pending',
  },
  approved_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE,
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  schema: 'user_db',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    afterSync(options) {
      if (options.hooks === false) return;
    }
  }
});

export default User;
