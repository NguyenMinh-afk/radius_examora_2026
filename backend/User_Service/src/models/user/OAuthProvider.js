const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../config/sequelize');

class OAuthProvider extends Model {}

OAuthProvider.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  provider: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  provider_user_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  access_token: DataTypes.TEXT,
  refresh_token: DataTypes.TEXT,
  token_expires_at: DataTypes.DATE,
  created_at: DataTypes.DATE,
}, {
  sequelize,
  modelName: 'OAuthProvider',
  tableName: 'oauth_providers',
  timestamps: false,
});

module.exports = OAuthProvider;
