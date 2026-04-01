const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../config/sequelize');

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
  timestamps: false,
});

module.exports = SubmissionAnswer;
