const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../config/sequelize');

class AIGenerationRequest extends Model {}

AIGenerationRequest.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  subject_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  chapter_id: DataTypes.INTEGER,
  knowledge_unit_id: DataTypes.INTEGER,
  difficulty: DataTypes.STRING,
  question_type: DataTypes.STRING,
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  context: DataTypes.TEXT,
  reference_materials: DataTypes.TEXT,
  style_preferences: DataTypes.JSONB,
  status: DataTypes.STRING,
  progress: DataTypes.INTEGER,
  questions_generated: DataTypes.INTEGER,
  questions_accepted: DataTypes.INTEGER,
  error_message: DataTypes.TEXT,
  queue_job_id: DataTypes.STRING,
  started_at: DataTypes.DATE,
  completed_at: DataTypes.DATE,
  created_at: DataTypes.DATE,
}, {
  sequelize,
  modelName: 'AIGenerationRequest',
  tableName: 'ai_generation_requests',
  timestamps: false,
});

module.exports = AIGenerationRequest;
