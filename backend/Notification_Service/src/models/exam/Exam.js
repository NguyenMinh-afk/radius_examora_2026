const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../config/sequelize');

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
});

module.exports = Exam;
