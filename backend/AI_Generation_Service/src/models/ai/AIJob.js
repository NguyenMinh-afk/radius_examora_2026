/**
 * AI Job Model - ai_db.ai_jobs
 * Lưu trữ các job AI async
 */
import { DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize.js';

const AIJob = sequelize.define('AIJob', {
  ai_job_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    field: 'ai_job_id',
  },
  document_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'documents',
      key: 'document_id',
    },
  },
  requested_by: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'requested_by',
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'RUNNING', 'COMPLETED', 'FAILED'),
    defaultValue: 'PENDING',
  },
  retry_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  result_artifact_path: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  error_message: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  trace_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'ai_jobs',
  schema: 'ai_db',
  timestamps: true,
  underscored: true,
});

export default AIJob;
