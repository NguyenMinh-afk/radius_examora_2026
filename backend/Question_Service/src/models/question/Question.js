/**
 * Question Model - exam_bank_db.question_db.questions
 */
import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';

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
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'multiple_choice',
    field: 'question_type',
  },
  difficulty: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'medium',
    field: 'difficulty',
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'content',
  },
  options: {
    type: DataTypes.JSONB,
    allowNull: false,
    field: 'options',
  },
  correct_answer: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'correct_answer',
  },
  explanation: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'explanation',
  },
  points: {
    type: DataTypes.DECIMAL(5,2),
    allowNull: true,
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
    field: 'keywords',
  },
  is_ai_generated: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
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
    allowNull: true,
    defaultValue: true,
    field: 'is_active',
  },
  is_public: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
    field: 'is_public',
  },
}, {
  sequelize,
  modelName: 'Question',
  tableName: 'questions',
  schema: 'question_db',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default Question;
