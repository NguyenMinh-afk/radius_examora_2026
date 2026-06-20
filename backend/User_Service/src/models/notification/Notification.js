import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/sequelize.js";

class Notification extends Model {}

Notification.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "message",
    },
    action_url: DataTypes.TEXT,
    action_data: DataTypes.JSONB,
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    read_at: DataTypes.DATE,
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "Notification",
    tableName: "notifications",
    schema: "notification_db",
    timestamps: false,
  }
);

export default Notification;
