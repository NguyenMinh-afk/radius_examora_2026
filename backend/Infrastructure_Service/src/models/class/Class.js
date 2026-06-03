const { DataTypes, Model } = require('sequelize');
const  sequelize  = require('../../config/sequelize');

class Class extends Model {}

Class.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: DataTypes.STRING,
  grade_level: DataTypes.STRING,
  school_year: DataTypes.STRING,
  homeroom_teacher_id: DataTypes.UUID,
  created_at: DataTypes.DATE,
}, {
  sequelize,
  modelName: 'Class',
  tableName: 'classes',
  timestamps: false,
});

module.exports = Class;
