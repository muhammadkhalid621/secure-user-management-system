import { PermissionModel } from "./permission.model.js";
import { RoleModel } from "./role.model.js";
import { UserModel } from "./user.model.js";

let initialized = false;

export const initModels = () => {
  if (initialized) {
    return;
  }

  UserModel.belongsToMany(RoleModel, {
    through: "user_roles",
    as: "roles",
    foreignKey: "user_id",
    otherKey: "role_id",
    timestamps: true
  });

  RoleModel.belongsToMany(UserModel, {
    through: "user_roles",
    as: "users",
    foreignKey: "role_id",
    otherKey: "user_id",
    timestamps: true
  });

  RoleModel.belongsToMany(PermissionModel, {
    through: "role_permissions",
    as: "permissions",
    foreignKey: "role_id",
    otherKey: "permission_id",
    timestamps: true
  });

  PermissionModel.belongsToMany(RoleModel, {
    through: "role_permissions",
    as: "roles",
    foreignKey: "permission_id",
    otherKey: "role_id",
    timestamps: true
  });

  initialized = true;
};
