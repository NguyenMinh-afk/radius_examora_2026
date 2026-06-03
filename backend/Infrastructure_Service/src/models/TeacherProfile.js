
/**
 * Model lưu thông tin hồ sơ giáo viên
 * @module models/TeacherProfile
 */
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/sequelize');

/**
 * @class TeacherProfile
 * @property {UUID} user_id - Mã người dùng (giáo viên)
 * @property {number} teaching_experience_years - Số năm kinh nghiệm
 * @property {string} highest_degree - Bằng cấp cao nhất
 * @property {string} subjects_teaching - Môn dạy
 */
class TeacherProfile extends Model {}

TeacherProfile.init({
  user_id: {
    type: DataTypes.UUID,
    primaryKey: true,
    references: { model: 'users', key: 'id' },
  },
  teaching_experience_years: DataTypes.INTEGER, // Số năm kinh nghiệm
  highest_degree: DataTypes.STRING, // Bằng cấp cao nhất
  subjects_teaching: DataTypes.STRING, // Môn dạy
}, {
  sequelize,
  modelName: 'TeacherProfile',
  tableName: 'teacher_profiles',
  timestamps: false,
});

module.exports = TeacherProfile;
