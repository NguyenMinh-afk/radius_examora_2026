/**
 * UserProfile Model - Cross-schema reference từ user_db
 * ESM - exam_db.user_profiles
 * Chứa teacher_code, teacher_department, teacher_specialization
 */
import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';

class UserProfile extends Model {}

UserProfile.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
  },
  date_of_birth: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  gender: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  school_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  class_code: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  student_code: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  teacher_code: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  teacher_department: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  teacher_specialization: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'UserProfile',
  tableName: 'user_profiles',
  schema: 'user_db',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default UserProfile;
