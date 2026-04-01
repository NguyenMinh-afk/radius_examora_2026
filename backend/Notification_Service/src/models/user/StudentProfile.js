const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../config/sequelize');

class StudentProfile extends Model {}

StudentProfile.init({
  user_id: {
    type: DataTypes.UUID,
    primaryKey: true,
    references: { model: 'users', key: 'id' },
  },
  student_code: DataTypes.STRING,
  current_grade_level: DataTypes.STRING,
  admission_year: DataTypes.INTEGER,
  academic_year: DataTypes.STRING,
}, {
  sequelize,
  modelName: 'StudentProfile',
  tableName: 'student_profiles',
  timestamps: false,
});

module.exports = StudentProfile;
