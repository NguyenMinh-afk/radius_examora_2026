const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../config/sequelize');

class QuestionTagRelation extends Model {}

QuestionTagRelation.init({
  question_id: {
    type: DataTypes.UUID,
    primaryKey: true,
  },
  tag_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
}, {
  sequelize,
  modelName: 'QuestionTagRelation',
  tableName: 'question_tag_relations',
  timestamps: false,
});

module.exports = QuestionTagRelation;
