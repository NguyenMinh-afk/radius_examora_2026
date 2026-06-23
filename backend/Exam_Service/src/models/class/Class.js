/**
 * Class Model
 * ESM - exam_db.classes
 */
import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';

class Class extends Model {}

Class.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  teacher_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  class_code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  course_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  year_level: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  academic_year: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  semester: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE,
}, {
  sequelize,
  modelName: 'Class',
  tableName: 'classes',
  schema: 'exam_db',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default Class;
