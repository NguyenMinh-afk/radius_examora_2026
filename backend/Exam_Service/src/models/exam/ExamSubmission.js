/**
 * ExamSubmission Model
 * ESM
 */
import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';

class ExamSubmission extends Model {}

ExamSubmission.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  exam_id: DataTypes.UUID,
  user_id: DataTypes.UUID,
  started_at: DataTypes.DATE,
  finished_at: DataTypes.DATE,
  score: DataTypes.FLOAT,
  status: DataTypes.STRING,
  created_at: DataTypes.DATE,
}, {
  sequelize,
  modelName: 'ExamSubmission',
  tableName: 'exam_submissions',
  schema: 'exam_db',
  timestamps: false,
});

export default ExamSubmission;
