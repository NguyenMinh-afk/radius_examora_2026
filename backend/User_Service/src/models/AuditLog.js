/**
 * AuditLog Model - Admin action audit trail (infra_observability.audit_logs)
 * User_Service dùng để ghi log các hành động admin
 */
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize.js';

class AuditLog extends Model {}

AuditLog.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  actor_id: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'actor_id',
  },
  action: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  entity_type: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'entity_type',
  },
  entity_id: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'entity_id',
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true,
    field: 'ip_address',
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'user_agent',
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at',
  },
}, {
  sequelize,
  modelName: 'AuditLog',
  tableName: 'audit_logs',
  timestamps: false,
  createdAt: 'created_at',
  updatedAt: false,
  schema: 'infra_observability',
});

export default AuditLog;
