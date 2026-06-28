/**
 * AI Generation Request Model
 * Lưu trữ các request tạo câu hỏi từ AI
 */
import { DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize.js';

const AIGenerationRequest = sequelize.define('AIGenerationRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  course_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  topic: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  question_count: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
  },
  question_type: {
    type: DataTypes.ENUM('multiple_choice', 'true_false', 'essay', 'mixed'),
    defaultValue: 'multiple_choice',
  },
  difficulty: {
    type: DataTypes.ENUM('easy', 'medium', 'hard', 'mixed'),
    defaultValue: 'medium',
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
    defaultValue: 'pending',
  },
  ai_model: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  error_message: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
}, {
  tableName: 'ai_generation_requests',
  timestamps: true,
  underscored: true,
});

export default AIGenerationRequest;
