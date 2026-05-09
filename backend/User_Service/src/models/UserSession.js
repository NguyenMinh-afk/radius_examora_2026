import { DataTypes, Model } from "sequelize";
import sequelize from "../config/sequelize.js";

class UserSession extends Model {}

UserSession.init(
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
    session_token: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
    refresh_token: {
      type: DataTypes.TEXT,
      unique: true,
    },
    device_type: DataTypes.STRING,
    device_name: DataTypes.STRING,
    browser: DataTypes.STRING,
    os: DataTypes.STRING,
    ip_address: DataTypes.INET,
    user_agent: DataTypes.TEXT,
    country: DataTypes.STRING,
    city: DataTypes.STRING,
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    last_activity: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "UserSession",
    tableName: "user_sessions",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default UserSession;
