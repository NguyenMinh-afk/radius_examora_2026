const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../config/sequelize');

class KnowledgeUnit extends Model {}

KnowledgeUnit.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  chapter_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: DataTypes.TEXT,
  learning_objectives: DataTypes.TEXT,
  created_at: DataTypes.DATE,
}, {
  sequelize,
  modelName: 'KnowledgeUnit',
  tableName: 'knowledge_units',
  timestamps: false,
});

module.exports = KnowledgeUnit;
