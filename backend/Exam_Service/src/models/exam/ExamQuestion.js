/**
 * ExamQuestion Model
 * ESM
 */
import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';

class ExamQuestion extends Model {}

ExamQuestion.init({
  exam_id: {
    type: DataTypes.UUID,
    primaryKey: true,
    references: { model: 'exams', key: 'id' },
  },
  question_id: {
    type: DataTypes.UUID,
    primaryKey: true,
    references: { model: 'questions', key: 'id' },
  },
  order: DataTypes.INTEGER,
  score: DataTypes.FLOAT,
}, {
  sequelize,
  modelName: 'ExamQuestion',
  tableName: 'exam_questions',
  schema: 'exam_db',
  timestamps: false,
});

export default ExamQuestion;
