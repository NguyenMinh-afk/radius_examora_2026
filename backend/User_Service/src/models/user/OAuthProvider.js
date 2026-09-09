import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/sequelize.js";

class OAuthProvider extends Model {}

OAuthProvider.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
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
  },
  {
    sequelize,
    modelName: "OAuthProvider",
    tableName: "oauth_providers",
    schema: "user_db",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["provider", "provider_user_id"],
      },
    ],
  }
);

export default OAuthProvider;
