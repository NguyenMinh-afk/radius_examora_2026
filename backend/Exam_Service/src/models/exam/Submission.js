/**
 * Submission Model
 * ESM
 */
import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';

class Submission extends Model {}

Submission.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  exam_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'exams', key: 'id' },
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  started_at: DataTypes.DATE,
  finished_at: DataTypes.DATE,
  score: DataTypes.FLOAT,
  status: DataTypes.STRING,
}, {
  sequelize,
  modelName: 'Submission',
  tableName: 'submissions',
  schema: 'exam_db',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default Submission;
