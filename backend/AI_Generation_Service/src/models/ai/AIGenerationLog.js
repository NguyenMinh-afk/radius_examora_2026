const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../config/sequelize');

class AIGenerationLog extends Model {}

AIGenerationLog.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  request_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  question_id: DataTypes.UUID,
  ai_model: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ai_provider: DataTypes.STRING,
  model_version: DataTypes.STRING,
  prompt: DataTypes.TEXT,
  response: DataTypes.TEXT,
  tokens_used: DataTypes.INTEGER,
  generation_time: DataTypes.DECIMAL,
  cost: DataTypes.DECIMAL,
  confidence_score: DataTypes.DECIMAL,
  quality_assessment: DataTypes.JSONB,
  status: DataTypes.STRING,
  error_message: DataTypes.TEXT,
  created_at: DataTypes.DATE,
}, {
  sequelize,
  modelName: 'AIGenerationLog',
  tableName: 'ai_generation_logs',
  timestamps: false,
});

module.exports = AIGenerationLog;
