/**
 * Course Model (course_db.courses)
 * User_Service dùng để admin quản lý courses
 */
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize.js';

class Course extends Model {}

Course.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  faculty_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'faculty_id',
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  credits: {
    type: DataTypes.INTEGER,
    defaultValue: 3,
  },
  semester_type: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'semester_type',
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at',
  },
  updated_at: {
    type: DataTypes.DATE,
    field: 'updated_at',
  },
}, {
  sequelize,
  modelName: 'Course',
  tableName: 'courses',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  schema: 'course_db',
});

export default Course;
