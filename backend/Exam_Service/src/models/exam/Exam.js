/**
 * Exam Model
 * ESM
 */
import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';

class Exam extends Model {}

Exam.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'title',
  },
  description: DataTypes.TEXT,
  created_by: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  course_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'course_id',
  },
  year_level: DataTypes.STRING,
  exam_type: DataTypes.STRING,
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 60,
    field: 'duration',
  },
  total_points: {
    type: DataTypes.DECIMAL(5,2),
    allowNull: false,
    defaultValue: 100,
    field: 'total_points',
  },
  passing_score: {
    type: DataTypes.DECIMAL(5,2),
    field: 'passing_score',
  },
  is_public: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_public',
  },
}, {
  sequelize,
  modelName: 'Exam',
  tableName: 'exams',
  schema: 'exam_db',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Exam;
