const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../config/sequelize');

class Question extends Model {}

Question.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  difficulty: DataTypes.STRING,
  subject: DataTypes.STRING,
  grade_level: DataTypes.STRING,
  created_by: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  sequelize,
  modelName: 'Question',
  tableName: 'questions',
});

module.exports = Question;
