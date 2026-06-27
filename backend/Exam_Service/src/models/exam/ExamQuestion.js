/**
 * ExamQuestion Model
 * ESM
 */
import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';

class ExamQuestion extends Model {}

ExamQuestion.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  exam_id: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'exam_id',
  },
  question_id: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'question_id',
  },
  question_order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'question_order',
  },
  points: {
    type: DataTypes.DECIMAL(5,2),
    allowNull: false,
    field: 'points',
  },
  time_limit: DataTypes.INTEGER,
  is_required: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_required',
  },
}, {
  sequelize,
  modelName: 'ExamQuestion',
  tableName: 'exam_questions',
  schema: 'exam_db',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default ExamQuestion;
