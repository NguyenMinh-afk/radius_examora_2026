const { DataTypes, Model } = require('sequelize');
const  sequelize  = require('../../config/sequelize');

class CollectionQuestion extends Model {}

CollectionQuestion.init({
  collection_id: {
    type: DataTypes.UUID,
    primaryKey: true,
  },
  question_id: {
    type: DataTypes.UUID,
    primaryKey: true,
  },
  order: DataTypes.INTEGER,
}, {
  sequelize,
  modelName: 'CollectionQuestion',
  tableName: 'collection_questions',
  timestamps: false,
});

module.exports = CollectionQuestion;
