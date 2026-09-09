/**
 * SubmissionAnswer Model
 * ESM
 */
import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';

class SubmissionAnswer extends Model {}

SubmissionAnswer.init({
  submission_id: {
    type: DataTypes.UUID,
    primaryKey: true,
    references: { model: 'submissions', key: 'id' },
  },
  question_id: {
    type: DataTypes.UUID,
    primaryKey: true,
    references: { model: 'questions', key: 'id' },
  },
  answer_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'answers', key: 'id' },
  },
  content: DataTypes.TEXT,
  is_correct: DataTypes.BOOLEAN,
  score: DataTypes.FLOAT,
}, {
  sequelize,
  modelName: 'SubmissionAnswer',
  tableName: 'submission_answers',
  schema: 'exam_db',
  timestamps: false,
});

export default SubmissionAnswer;
