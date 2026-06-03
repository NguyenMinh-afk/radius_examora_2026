const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../config/sequelize');

class SystemAnalytics extends Model {}

SystemAnalytics.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  metric: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  value: DataTypes.FLOAT,
  recorded_at: DataTypes.DATE,
  details: DataTypes.JSONB,
}, {
  sequelize,
  modelName: 'SystemAnalytics',
  tableName: 'system_analytics',
  timestamps: false,
});

module.exports = SystemAnalytics;
