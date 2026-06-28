/**
 * Question Model (question_db.questions)
 * User_Service dùng để admin kiểm duyệt câu hỏi
 */
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize.js';

class Question extends Model {}

Question.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  course_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'course_id',
  },
  chapter_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'chapter_id',
  },
  knowledge_unit_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'knowledge_unit_id',
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'created_by',
  },
  question_type: {
    type: DataTypes.ENUM('multiple_choice', 'true_false', 'matching', 'fill_blank'),
    defaultValue: 'multiple_choice',
    field: 'question_type',
  },
  difficulty: {
    type: DataTypes.ENUM('easy', 'medium', 'hard', 'very_hard'),
    defaultValue: 'medium',
    field: 'difficulty',
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  options: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
  correct_answer: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'correct_answer',
  },
  explanation: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  points: {
    type: DataTypes.DECIMAL(5,2),
    defaultValue: 1.0,
    field: 'points',
  },
  time_limit: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'time_limit',
  },
  keywords: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
  },
  is_ai_generated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_ai_generated',
  },
  ai_model: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'ai_model',
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
  },
  is_public: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_public',
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
  modelName: 'Question',
  tableName: 'questions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  schema: 'question_db',
});

export default Question;
