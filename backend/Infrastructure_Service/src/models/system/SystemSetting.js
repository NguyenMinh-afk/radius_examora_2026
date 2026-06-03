const { DataTypes, Model } = require('sequelize');
const  sequelize  = require('../../config/sequelize');

class SystemSetting extends Model {}

SystemSetting.init({
  key: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  value: DataTypes.JSONB,
  description: DataTypes.TEXT,
  updated_at: DataTypes.DATE,
}, {
  sequelize,
  modelName: 'SystemSetting',
  tableName: 'system_settings',
  timestamps: false,
});

module.exports = SystemSetting;
