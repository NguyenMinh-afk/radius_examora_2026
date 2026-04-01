const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../config/sequelize');

class Answer extends Model {}

Answer.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  question_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'questions', key: 'id' },
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  is_correct: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  explanation: DataTypes.TEXT,
}, {
  sequelize,
  modelName: 'Answer',
  tableName: 'answers',
});

module.exports = Answer;
