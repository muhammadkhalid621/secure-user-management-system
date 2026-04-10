import { col, fn } from "sequelize";
import { PERMISSIONS } from "../../constants/permissions.js";
import { AuditLogModel } from "../../database/models/audit-log.model.js";
import { RoleModel } from "../../database/models/role.model.js";
import { RolePermissionModel } from "../../database/models/role-permission.model.js";
import { UserModel } from "../../database/models/user.model.js";
import { UserRoleModel } from "../../database/models/user-role.model.js";
import type { AuthContext } from "../auth/auth.types.js";

type RoleDistributionItem = {
  label: string;
  value: number;
  toneClassName: string;
};

type SummaryLevelItem = {
  label: "Info" | "Warn" | "Error";
  value: number;
  toneClassName: string;
};

export type DashboardSummary = {
  userTotal: number;
  roleTotal: number;
  recentLogCount: number;
  multiRoleUserCount: number;
  permissionsMapped: number;
  errorCount: number;
  roleDistribution: RoleDistributionItem[];
  recentLevels: SummaryLevelItem[];
};

const emptyLevels: SummaryLevelItem[] = [
  { label: "Info", value: 0, toneClassName: "bg-emerald-500" },
  { label: "Warn", value: 0, toneClassName: "bg-amber-500" },
  { label: "Error", value: 0, toneClassName: "bg-red-500" }
];

export class DashboardService {
  async getSummary(auth: AuthContext): Promise<DashboardSummary> {
    const canReadUsers = auth.permissions.includes(PERMISSIONS.USERS_READ);
    const canReadRoles = auth.permissions.includes(PERMISSIONS.ROLES_READ);
    const canReadAuditLogs = auth.permissions.includes(PERMISSIONS.AUDIT_LOGS_READ);

    const [
      userTotal,
      multiRoleRows,
      roleTotal,
      roles,
      userRoleCounts,
      permissionCounts,
      recentLogs
    ] = await Promise.all([
      canReadUsers ? UserModel.count() : Promise.resolve(0),
      canReadUsers
        ? UserRoleModel.findAll({
            attributes: ["userId", [fn("COUNT", col("role_id")), "roleCount"]],
            group: ["user_id"],
            raw: true
          })
        : Promise.resolve([]),
      canReadRoles ? RoleModel.count() : Promise.resolve(0),
      canReadRoles
        ? RoleModel.findAll({
            attributes: ["id", "name"],
            order: [["name", "asc"]],
            raw: true
          })
        : Promise.resolve([]),
      canReadUsers && canReadRoles
        ? UserRoleModel.findAll({
            attributes: ["roleId", [fn("COUNT", col("user_id")), "userCount"]],
            group: ["role_id"],
            raw: true
          })
        : Promise.resolve([]),
      canReadRoles
        ? RolePermissionModel.findAll({
            attributes: ["roleId", [fn("COUNT", col("permission_id")), "permissionCount"]],
            group: ["role_id"],
            raw: true
          })
        : Promise.resolve([]),
      canReadAuditLogs
        ? AuditLogModel.findAll({
            attributes: ["level"],
            order: [["createdAt", "desc"]],
            limit: 5,
            raw: true
          })
        : Promise.resolve([])
    ]);

    const multiRoleUserCount = Array.isArray(multiRoleRows)
      ? multiRoleRows.filter((row) => Number((row as { roleCount?: unknown }).roleCount ?? 0) > 1).length
      : 0;

    const roleCountMap = new Map(
      (userRoleCounts as unknown as Array<{ roleId: string; userCount: string | number }>).map((row) => [
        row.roleId,
        Number(row.userCount)
      ])
    );

    const permissionCountMap = new Map(
      (permissionCounts as unknown as Array<{ roleId: string; permissionCount: string | number }>).map((row) => [
        row.roleId,
        Number(row.permissionCount)
      ])
    );

    const roleDistribution = (roles as Array<{ id: string; name: string }>).map((role) => ({
      label: role.name,
      value: roleCountMap.get(role.id) ?? 0,
      toneClassName: "bg-slate-900"
    }));

    const permissionsMapped = Array.from(permissionCountMap.values()).reduce(
      (sum, count) => sum + count,
      0
    );

    const recentLevels = emptyLevels.map((level) => ({
      ...level,
      value: (recentLogs as Array<{ level: "info" | "warn" | "error" }>).filter(
        (item) => item.level.toLowerCase() === level.label.toLowerCase()
      ).length
    }));

    return {
      userTotal,
      roleTotal,
      recentLogCount: Array.isArray(recentLogs) ? recentLogs.length : 0,
      multiRoleUserCount,
      permissionsMapped,
      errorCount: recentLevels.find((item) => item.label === "Error")?.value ?? 0,
      roleDistribution,
      recentLevels
    };
  }
}

export const dashboardService = new DashboardService();
