const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../config/sequelize');

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
  status: DataTypes.STRING,
  submitted_at: DataTypes.DATE,
  grade: DataTypes.FLOAT,
  feedback: DataTypes.TEXT,
  created_at: DataTypes.DATE,
}, {
  sequelize,
  modelName: 'StudentAssignment',
  tableName: 'student_assignments',
  timestamps: false,
});

module.exports = StudentAssignment;
