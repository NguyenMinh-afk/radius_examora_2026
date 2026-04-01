const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../config/sequelize');

class Submission extends Model {}

Submission.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  exam_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'exams', key: 'id' },
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  started_at: DataTypes.DATE,
  finished_at: DataTypes.DATE,
  score: DataTypes.FLOAT,
  status: DataTypes.STRING,
}, {
  sequelize,
  modelName: 'Submission',
  tableName: 'submissions',
});

module.exports = Submission;
