/**
 * AI Generation Request Model - ai_db.ai_generation_requests
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
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  chapter_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  knowledge_unit_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  question_type: {
    type: DataTypes.ENUM('multiple_choice', 'true_false', 'matching', 'fill_blank'),
    allowNull: true,
  },
  difficulty: {
    type: DataTypes.ENUM('easy', 'medium', 'hard', 'very_hard'),
    allowNull: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10,
  },
  context: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
    defaultValue: 'pending',
  },
  progress: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  error_message: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  trace_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  started_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'ai_generation_requests',
  schema: 'ai_db',
  timestamps: true,
  updatedAt: false,
  underscored: true,
});

export default AIGenerationRequest;
