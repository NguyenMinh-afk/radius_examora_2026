const { DataTypes, Model } = require('sequelize');
const  sequelize  = require('../../config/sequelize');

class EmailLog extends Model {}

EmailLog.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  to: DataTypes.STRING,
  subject: DataTypes.STRING,
  body: DataTypes.TEXT,
  status: DataTypes.STRING,
  error: DataTypes.TEXT,
  sent_at: DataTypes.DATE,
  created_at: DataTypes.DATE,
}, {
  sequelize,
  modelName: 'EmailLog',
  tableName: 'email_logs',
  timestamps: false,
});

module.exports = EmailLog;
