/**
 * ExamAssignment Model
 * ESM - exam_db.exam_assignments
 */
import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';

class ExamAssignment extends Model {}

ExamAssignment.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  exam_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  class_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  instructions: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  end_time: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  max_attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  shuffle_questions: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  shuffle_answers: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  show_result: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  show_answer: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  assigned_by: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  trace_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE,
}, {
  sequelize,
  modelName: 'ExamAssignment',
  tableName: 'exam_assignments',
  schema: 'exam_db',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default ExamAssignment;
