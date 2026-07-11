/**
 * AI Generation Log Model - ai_db.ai_generation_logs
 * Lưu trữ log chi tiết của từng lần generation
 */
import { DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize.js';

const AIGenerationLog = sequelize.define('AIGenerationLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  request_id: {
    type: DataTypes.UUID,
    allowNull: true,  // nullable để khớp với schema_optimized.sql
    references: {
      model: 'ai_generation_requests',
      key: 'id',
    },
  },
  question_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  ai_model: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  prompt: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  response: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  tokens_used: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  cost: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING(50),
    defaultValue: 'success',
  },
  error_message: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  trace_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
}, {
  tableName: 'ai_generation_logs',
  schema: 'ai_db',
  timestamps: true,
  underscored: true,
});

export default AIGenerationLog;
