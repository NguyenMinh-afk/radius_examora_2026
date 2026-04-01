const { DataTypes, Model } = require('sequelize');
const  sequelize  = require('../../config/sequelize');

class EmailTemplate extends Model {}

EmailTemplate.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: DataTypes.STRING,
  subject: DataTypes.STRING,
  body: DataTypes.TEXT,
  created_at: DataTypes.DATE,
}, {
  sequelize,
  modelName: 'EmailTemplate',
  tableName: 'email_templates',
  timestamps: false,
});

module.exports = EmailTemplate;
