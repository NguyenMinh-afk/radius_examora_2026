const { DataTypes, Model } = require('sequelize');
const  sequelize  = require('../../config/sequelize');

class GeneratedReport extends Model {}

GeneratedReport.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: DataTypes.UUID,
  report_template_id: DataTypes.UUID,
  data: DataTypes.JSONB,
  generated_at: DataTypes.DATE,
  file_url: DataTypes.STRING,
  created_at: DataTypes.DATE,
}, {
  sequelize,
  modelName: 'GeneratedReport',
  tableName: 'generated_reports',
  timestamps: false,
});

module.exports = GeneratedReport;
