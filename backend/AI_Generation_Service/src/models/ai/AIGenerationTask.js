/**
 * AI Generation Task Model - ai_db.ai_generation_tasks
 * Lưu trữ các task con trong một request
 */
import { DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize.js';

const AIGenerationTask = sequelize.define('AIGenerationTask', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  request_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'ai_generation_requests',
      key: 'id',
    },
  },
  subject_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  topic: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  input_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  input_reference: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  number_of_questions: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  difficulty: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
    defaultValue: 'pending',
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  error_message: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'ai_generation_tasks',
  schema: 'ai_db',
  timestamps: true,
  underscored: true,
});

export default AIGenerationTask;
