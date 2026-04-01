const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../config/sequelize');

class Chapter extends Model {}

Chapter.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  subject_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  grade_level: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  chapter_number: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: DataTypes.TEXT,
  curriculum_standard: DataTypes.STRING,
  created_at: DataTypes.DATE,
}, {
  sequelize,
  modelName: 'Chapter',
  tableName: 'chapters',
  timestamps: false,
});

module.exports = Chapter;
