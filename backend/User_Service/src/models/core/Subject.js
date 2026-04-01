const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../config/sequelize');

class Subject extends Model {}

Subject.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: DataTypes.STRING,
}, {
  sequelize,
  modelName: 'Subject',
  tableName: 'subjects',
});

module.exports = Subject;
