/**
 * StudentAssignment Model
 * ESM - exam_db.student_assignments
 */
import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';

class StudentAssignment extends Model {}

StudentAssignment.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  student_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  assignment_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING(50),
    defaultValue: 'assigned',
  },
  attempts_used: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  sequelize,
  modelName: 'StudentAssignment',
  tableName: 'student_assignments',
  schema: 'exam_db',
  timestamps: false,
});

export default StudentAssignment;
