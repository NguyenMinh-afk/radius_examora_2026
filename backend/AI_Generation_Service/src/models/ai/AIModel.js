/**
 * AI Model Configuration Model
 * Lưu trữ cấu hình các AI models
 */
import { DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize.js';

const AIModel = sequelize.define('AIModel', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  provider: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  api_endpoint: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  api_key_env: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  model_version: {
    type: DataTypes.STRING(50),
    defaultValue: 'latest',
  },
  max_tokens: {
    type: DataTypes.INTEGER,
    defaultValue: 4096,
  },
  temperature: {
    type: DataTypes.FLOAT,
    defaultValue: 0.7,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  config: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
}, {
  tableName: 'ai_models',
  timestamps: true,
  underscored: true,
});

export default AIModel;
