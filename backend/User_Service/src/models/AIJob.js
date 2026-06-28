/**
 * AIJob Model - AI generation jobs (ai_db.ai_jobs)
 * User_Service dùng để admin monitor AI jobs
 */
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize.js';

class AIJob extends Model {}

AIJob.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    field: 'ai_job_id',
  },
  document_id: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'document_id',
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'requested_by',
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'RUNNING', 'COMPLETED', 'FAILED'),
    defaultValue: 'PENDING',
    allowNull: false,
  },
  retry_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'retry_count',
  },
  result_artifact_path: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'result_artifact_path',
  },
  error_message: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'error_message',
  },
  trace_id: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'trace_id',
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'completed_at',
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at',
  },
  updated_at: {
    type: DataTypes.DATE,
    field: 'updated_at',
  },
}, {
  sequelize,
  modelName: 'AIJob',
  tableName: 'ai_jobs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  schema: 'ai_db',
});

export default AIJob;
