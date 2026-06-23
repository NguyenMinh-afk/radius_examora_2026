/**
 * Exam Model
 * ESM
 */
import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';

class Exam extends Model {}

Exam.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: DataTypes.TEXT,
  created_by: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  sequelize,
  modelName: 'Exam',
  tableName: 'exams',
  schema: 'exam_db',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default Exam;
