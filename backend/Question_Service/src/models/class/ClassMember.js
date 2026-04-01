const { DataTypes, Model } = require('sequelize');
const  sequelize  = require('../../config/sequelize');

class ClassMember extends Model {}

ClassMember.init({
  class_id: {
    type: DataTypes.UUID,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    primaryKey: true,
  },
  role: DataTypes.STRING,
  joined_at: DataTypes.DATE,
}, {
  sequelize,
  modelName: 'ClassMember',
  tableName: 'class_members',
  timestamps: false,
});

module.exports = ClassMember;
