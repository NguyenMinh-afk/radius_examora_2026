const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../config/sequelize');

class School extends Model {}

School.init({
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
  address: DataTypes.STRING,
  district: DataTypes.STRING,
  city: DataTypes.STRING,
  ward: DataTypes.STRING,
}, {
  sequelize,
  modelName: 'School',
  tableName: 'schools',
});

module.exports = School;
