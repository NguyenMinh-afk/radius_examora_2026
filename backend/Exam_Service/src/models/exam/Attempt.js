/**
 * Attempt Model
 * ESM - exam_db.attempts
 */
import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';

class Attempt extends Model {}

Attempt.init({
  attempt_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    field: 'attempt_id',
  },
  exam_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  student_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  assignment_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  attempt_number: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  started_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  ended_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  submitted_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  time_taken: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'in_progress',
  },
  score: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
  },
  percentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
  },
  correct_answers: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  wrong_answers: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  graded_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  trace_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE,
}, {
  sequelize,
  modelName: 'Attempt',
  tableName: 'attempts',
  schema: 'exam_db',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default Attempt;
