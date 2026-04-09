import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes
} from "sequelize";
import { sequelize } from "../sequelize.js";

export class AuditLogModel extends Model<
  InferAttributes<AuditLogModel>,
  InferCreationAttributes<AuditLogModel>
> {
  declare id: string;
  declare actorUserId: string | null;
  declare entityType: string;
  declare entityId: string | null;
  declare action: string;
  declare level: "info" | "warn" | "error";
  declare message: string;
  declare metadata: Record<string, unknown> | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

AuditLogModel.init(
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    actorUserId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "actor_user_id"
    },
    entityType: {
      type: DataTypes.STRING(80),
      allowNull: false,
      field: "entity_type"
    },
    entityId: {
      type: DataTypes.STRING(80),
      allowNull: true,
      field: "entity_id"
    },
    action: {
      type: DataTypes.STRING(80),
      allowNull: false
    },
    level: {
      type: DataTypes.ENUM("info", "warn", "error"),
      allowNull: false,
      defaultValue: "info"
    },
    message: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "created_at"
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "updated_at"
    }
  },
  {
    sequelize,
    modelName: "AuditLog",
    tableName: "audit_logs",
    timestamps: true
  }
);

