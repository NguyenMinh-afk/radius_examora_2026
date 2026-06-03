const { DataTypes, Model } = require('sequelize');
const  sequelize  = require('../../config/sequelize');

class AuditLog extends Model {}

AuditLog.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: DataTypes.UUID,
  action: DataTypes.STRING,
  target_table: DataTypes.STRING,
  target_id: DataTypes.UUID,
  changes: DataTypes.JSONB,
  ip_address: DataTypes.STRING,
  user_agent: DataTypes.TEXT,
  created_at: DataTypes.DATE,
}, {
  sequelize,
  modelName: 'AuditLog',
  tableName: 'audit_logs',
  timestamps: false,
});

module.exports = AuditLog;
