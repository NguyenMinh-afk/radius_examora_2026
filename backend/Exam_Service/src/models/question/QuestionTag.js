const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../config/sequelize');

class QuestionTag extends Model {}

QuestionTag.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  category: DataTypes.STRING,
  created_at: DataTypes.DATE,
}, {
  sequelize,
  modelName: 'QuestionTag',
  tableName: 'question_tags',
  timestamps: false,
});

module.exports = QuestionTag;
