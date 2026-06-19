import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/sequelize.js";

class AuditLog extends Model {}

AuditLog.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    actor_id: DataTypes.UUID,
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    entity_type: DataTypes.STRING,
    entity_id: DataTypes.UUID,
    metadata: DataTypes.JSONB,
    ip_address: DataTypes.STRING,
    user_agent: DataTypes.TEXT,
    created_at: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: "AuditLog",
    tableName: "audit_logs",
    schema: "infra_observability",
    timestamps: false,
  }
);

export default AuditLog;
