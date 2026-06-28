/**
 * AI Generation Log Model
 * Lưu trữ log của quá trình generation
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
    allowNull: false,
  },
  level: {
    type: DataTypes.ENUM('info', 'warning', 'error'),
    defaultValue: 'info',
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
}, {
  tableName: 'ai_generation_logs',
  timestamps: true,
  underscored: true,
});

export default AIGenerationLog;
