import { RolePermissionModel } from "./role-permission.model.js";
import { PermissionModel } from "./permission.model.js";
import { RoleModel } from "./role.model.js";
import { UserModel } from "./user.model.js";
import { UserRoleModel } from "./user-role.model.js";

let initialized = false;

export const initModels = () => {
  if (initialized) {
    return;
  }

  UserModel.belongsToMany(RoleModel, {
    through: UserRoleModel,
    as: "roles",
    foreignKey: "userId",
    otherKey: "roleId",
    timestamps: true
  });

  RoleModel.belongsToMany(UserModel, {
    through: UserRoleModel,
    as: "users",
    foreignKey: "roleId",
    otherKey: "userId",
    timestamps: true
  });

  RoleModel.belongsToMany(PermissionModel, {
    through: RolePermissionModel,
    as: "permissions",
    foreignKey: "roleId",
    otherKey: "permissionId",
    timestamps: true
  });

  PermissionModel.belongsToMany(RoleModel, {
    through: RolePermissionModel,
    as: "roles",
    foreignKey: "permissionId",
    otherKey: "roleId",
    timestamps: true
  });

  initialized = true;
};
