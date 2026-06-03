const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../config/sequelize');

class LearningPathStep extends Model {}

LearningPathStep.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  learning_path_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  step_number: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  title: DataTypes.STRING,
  description: DataTypes.TEXT,
  content_type: DataTypes.STRING,
  content_id: DataTypes.UUID,
  created_at: DataTypes.DATE,
}, {
  sequelize,
  modelName: 'LearningPathStep',
  tableName: 'learning_path_steps',
  timestamps: false,
});

module.exports = LearningPathStep;
