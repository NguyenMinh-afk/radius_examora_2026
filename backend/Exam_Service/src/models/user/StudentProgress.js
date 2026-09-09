/**
 * StudentProgress Model
 * ESM
 */
import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';

class StudentProgress extends Model {}

StudentProgress.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  student_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  learning_path_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  step_id: DataTypes.UUID,
  status: DataTypes.STRING,
  started_at: DataTypes.DATE,
  completed_at: DataTypes.DATE,
  progress: DataTypes.FLOAT,
  created_at: DataTypes.DATE,
}, {
  sequelize,
  modelName: 'StudentProgress',
  tableName: 'student_progress',
  timestamps: false,
});

export default StudentProgress;
