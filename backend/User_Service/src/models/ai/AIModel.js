const { DataTypes, Model } = require('sequelize');
const  sequelize  = require('../../config/sequelize');

class AIModel extends Model {}

AIModel.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: DataTypes.STRING,
  provider: DataTypes.STRING,
  version: DataTypes.STRING,
  description: DataTypes.TEXT,
  is_active: DataTypes.BOOLEAN,
  created_at: DataTypes.DATE,
}, {
  sequelize,
  modelName: 'AIModel',
  tableName: 'ai_models',
  timestamps: false,
});

module.exports = AIModel;
