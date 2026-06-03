const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../config/sequelize');

class LearningActivity extends Model {}

LearningActivity.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: DataTypes.UUID,
  activity_type: DataTypes.STRING,
  target_id: DataTypes.UUID,
  data: DataTypes.JSONB,
  started_at: DataTypes.DATE,
  finished_at: DataTypes.DATE,
  created_at: DataTypes.DATE,
}, {
  sequelize,
  modelName: 'LearningActivity',
  tableName: 'learning_activities',
  timestamps: false,
});

module.exports = LearningActivity;
