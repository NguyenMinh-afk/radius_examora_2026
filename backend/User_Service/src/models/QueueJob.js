/**
 * QueueJob Model - Queue jobs (infra_eventing.queue_jobs)
 * User_Service dùng để admin monitor queue jobs
 */
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize.js';

class QueueJob extends Model {}

QueueJob.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  job_type: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'job_type',
  },
  queue_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'queue_name',
  },
  payload: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
  priority: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM('queued', 'running', 'completed', 'failed'),
    defaultValue: 'queued',
    allowNull: false,
  },
  attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  max_attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 3,
    field: 'max_attempts',
  },
  queued_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'queued_at',
  },
  started_at: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'started_at',
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'completed_at',
  },
  failed_at: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'failed_at',
  },
  result: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  error_message: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'error_message',
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'user_id',
  },
  related_id: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'related_id',
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
  modelName: 'QueueJob',
  tableName: 'queue_jobs',
  timestamps: false,
  createdAt: 'created_at',
  updatedAt: false,
  schema: 'infra_eventing',
});

export default QueueJob;
