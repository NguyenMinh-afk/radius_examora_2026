const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../config/sequelize');

class LearningMaterial extends Model {}

LearningMaterial.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: DataTypes.STRING,
  description: DataTypes.TEXT,
  type: DataTypes.STRING,
  url: DataTypes.STRING,
  uploaded_by: DataTypes.UUID,
  created_at: DataTypes.DATE,
}, {
  sequelize,
  modelName: 'LearningMaterial',
  tableName: 'learning_materials',
  timestamps: false,
});

module.exports = LearningMaterial;
