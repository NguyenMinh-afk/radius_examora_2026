const { DataTypes, Model } = require('sequelize');
const  sequelize  = require('../../config/sequelize');

class ReportTemplate extends Model {}

ReportTemplate.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: DataTypes.STRING,
  description: DataTypes.TEXT,
  template: DataTypes.TEXT,
  created_at: DataTypes.DATE,
}, {
  sequelize,
  modelName: 'ReportTemplate',
  tableName: 'report_templates',
  timestamps: false,
});

module.exports = ReportTemplate;
