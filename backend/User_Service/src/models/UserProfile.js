import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize.js';

class UserProfile extends Model {}

UserProfile.init({
  user_id: {
    type: DataTypes.UUID,
    primaryKey: true,
    references: { model: 'users', key: 'id' },
  },

  date_of_birth: DataTypes.DATEONLY,
  gender: DataTypes.STRING,
  address: DataTypes.STRING,
  permanent_address: DataTypes.STRING,
  city: DataTypes.STRING,
  district: DataTypes.STRING,
  ward: DataTypes.STRING,

  school_name: DataTypes.STRING,
  class_code: DataTypes.STRING,
  grade_level: DataTypes.STRING,

  student_code: DataTypes.STRING,

  teacher_code: DataTypes.STRING,
  teacher_department: DataTypes.STRING,
  teacher_specialization: DataTypes.STRING,

  bio: DataTypes.STRING,
  preferences: DataTypes.JSONB,
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