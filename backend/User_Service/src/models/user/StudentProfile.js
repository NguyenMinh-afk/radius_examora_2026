import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';

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

export default StudentProfile;
