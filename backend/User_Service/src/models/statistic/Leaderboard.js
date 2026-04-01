const { DataTypes, Model } = require('sequelize');
const  sequelize  = require('../../config/sequelize');

class Leaderboard extends Model {}

Leaderboard.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: DataTypes.STRING,
  description: DataTypes.TEXT,
  type: DataTypes.STRING,
  created_at: DataTypes.DATE,
}, {
  sequelize,
  modelName: 'Leaderboard',
  tableName: 'leaderboards',
  timestamps: false,
});

module.exports = Leaderboard;
