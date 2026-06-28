/**
 * SystemEvent Model - System event logs (infra_observability.system_events)
 * User_Service dùng để ghi log các sự kiện hệ thống
 */
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize.js';

class SystemEvent extends Model {}

SystemEvent.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  event_type: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'event_type',
  },
  source: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  aggregate_id: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'aggregate_id',
  },
  payload: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'created',
  },
  trace_id: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'trace_id',
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at',
  },
}, {
  sequelize,
  modelName: 'SystemEvent',
  tableName: 'system_events',
  timestamps: false,
  createdAt: 'created_at',
  updatedAt: false,
  schema: 'infra_observability',
});

export default SystemEvent;
