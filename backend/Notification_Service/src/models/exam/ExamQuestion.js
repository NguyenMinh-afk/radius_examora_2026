const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../config/sequelize');

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
  timestamps: false,
});

module.exports = ExamQuestion;
