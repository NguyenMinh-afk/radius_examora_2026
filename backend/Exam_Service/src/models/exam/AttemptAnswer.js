/**
 * AttemptAnswer Model
 * ESM - exam_db.attempt_answers
 * Lưu câu trả lời của học sinh cho mỗi câu hỏi trong attempt
 */
import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';

class AttemptAnswer extends Model {}

AttemptAnswer.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  attempt_id: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'attempt_id',
  },
  question_id: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'question_id',
  },
  selected_answer: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'selected_answer',
  },
  is_correct: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    field: 'is_correct',
  },
  points_earned: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    field: 'points_earned',
  },
  time_spent: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'time_spent',
  },
  created_at: DataTypes.DATE,
}, {
  sequelize,
  modelName: 'AttemptAnswer',
  tableName: 'attempt_answers',
  schema: 'exam_db',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

export default AttemptAnswer;
