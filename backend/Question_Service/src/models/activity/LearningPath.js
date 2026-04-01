const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../config/sequelize');

class LearningPath extends Model {}

LearningPath.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: DataTypes.STRING,
  description: DataTypes.TEXT,
  created_by: DataTypes.UUID,
  created_at: DataTypes.DATE,
}, {
  sequelize,
  modelName: 'LearningPath',
  tableName: 'learning_paths',
  timestamps: false,
});

module.exports = LearningPath;
