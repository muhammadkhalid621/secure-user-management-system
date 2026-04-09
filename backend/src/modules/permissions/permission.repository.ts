import { PermissionModel } from "../../database/models/permission.model.js";
import { Op } from "sequelize";
import type { ListQuery } from "../../lib/list-query.js";
import type { Permission } from "../roles/role.types.js";

class PermissionRepository {
  async findAll(
    listQuery?: ListQuery
  ): Promise<{ rows: Permission[]; count: number }> {
    const where = listQuery?.search
      ? {
          [Op.or]: [
            { name: { [Op.like]: `%${listQuery.search}%` } },
            { slug: { [Op.like]: `%${listQuery.search}%` } }
          ]
        }
      : undefined;

    const { count, rows } = await PermissionModel.findAndCountAll({
      where,
      limit: listQuery?.limit,
      offset: listQuery?.offset,
      order: [[listQuery?.sortBy ?? "slug", listQuery?.sortOrder ?? "asc"]]
    });

    return {
      rows: rows.map((permission) => permission.toJSON() as Permission),
      count
    };
  }

  async countByIds(ids: string[]): Promise<number> {
    return PermissionModel.count({
      where: {
        id: ids
      }
    });
  }
}

export const permissionRepository = new PermissionRepository();
