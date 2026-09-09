/**
 * QuestionVersion Model - exam_bank_db.question_db.question_versions
 *
 * Stores version snapshots of questions for tracking changes over time.
 * Each update creates a new version record before applying changes.
 */
import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';

class QuestionVersion extends Model {}

QuestionVersion.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  question_id: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'question_id',
  },
  version_number: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'version_number',
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'content',
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
  options: {
    type: DataTypes.JSONB,
    allowNull: false,
    field: 'options',
  },
  correct_answer: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: 'A',
    field: 'correct_answer',
  },
  explanation: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'explanation',
  },
  changed_by: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'changed_by',
  },
  change_reason: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'change_reason',
  },
}, {
  sequelize,
  modelName: 'QuestionVersion',
  tableName: 'question_versions',
  schema: 'question_db',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['question_id', 'version_number'],
      name: 'question_versions_qid_version_unique',
    },
    {
      fields: ['question_id'],
      name: 'idx_question_versions_question_id',
    },
  ],
});

export default QuestionVersion;
