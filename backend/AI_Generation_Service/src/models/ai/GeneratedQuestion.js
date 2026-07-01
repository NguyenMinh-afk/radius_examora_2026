/**
 * Generated Question Model - ai_db.generated_questions
 * Lưu trữ câu hỏi được AI sinh ra (trước khi review/approve)
 */
import { DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize.js';

const GeneratedQuestion = sequelize.define('GeneratedQuestion', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  task_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'ai_generation_tasks',
      key: 'id',
    },
  },
  question_content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  option_a: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  option_b: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  option_c: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  option_d: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  correct_answer: {
    type: DataTypes.CHAR(1),
    allowNull: true,
  },
  difficulty: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  topic: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  explanation: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending_review', 'approved', 'rejected', 'edited'),
    defaultValue: 'pending_review',
  },
}, {
  tableName: 'generated_questions',
  schema: 'ai_db',
  timestamps: true,
  underscored: true,
});

export default GeneratedQuestion;
