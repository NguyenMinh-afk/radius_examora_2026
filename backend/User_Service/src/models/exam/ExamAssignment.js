const { DataTypes, Model } = require('sequelize');
const  sequelize  = require('../../config/sequelize');

class ExamAssignment extends Model {}

ExamAssignment.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  exam_id: DataTypes.UUID,
  user_id: DataTypes.UUID,
  assigned_by: DataTypes.UUID,
  assigned_at: DataTypes.DATE,
  due_date: DataTypes.DATE,
  status: DataTypes.STRING,
  created_at: DataTypes.DATE,
}, {
  sequelize,
  modelName: 'ExamAssignment',
  tableName: 'exam_assignments',
  timestamps: false,
});

module.exports = ExamAssignment;
