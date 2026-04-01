const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../config/sequelize');

class QuestionVersion extends Model {}

QuestionVersion.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  question_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  version_number: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  options: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
  changed_by: DataTypes.UUID,
  change_note: DataTypes.TEXT,
  created_at: DataTypes.DATE,
}, {
  sequelize,
  modelName: 'QuestionVersion',
  tableName: 'question_versions',
  timestamps: false,
});

module.exports = QuestionVersion;
