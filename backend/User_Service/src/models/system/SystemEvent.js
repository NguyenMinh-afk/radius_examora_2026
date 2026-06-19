import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/sequelize.js";

class SystemEvent extends Model {}

SystemEvent.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    event_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    source: DataTypes.STRING,
    aggregate_id: DataTypes.UUID,
    payload: DataTypes.JSONB,
    status: {
      type: DataTypes.STRING,
      defaultValue: "created",
    },
    trace_id: DataTypes.STRING,
    created_at: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: "SystemEvent",
    tableName: "system_events",
    schema: "infra_observability",
    timestamps: false,
  }
);

export default SystemEvent;
