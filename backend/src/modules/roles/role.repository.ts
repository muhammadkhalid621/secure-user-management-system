import { randomUUID } from "node:crypto";
import { Op } from "sequelize";
import { PermissionModel } from "../../database/models/permission.model.js";
import { RoleModel } from "../../database/models/role.model.js";
import type { ListQuery } from "../../lib/list-query.js";
import type { Role } from "./role.types.js";

const roleInclude = [
  {
    model: PermissionModel,
    as: "permissions",
    through: { attributes: [] as string[] }
  }
];

class RoleRepository {
  async findAll(
    listQuery?: ListQuery
  ): Promise<{ rows: Role[]; count: number }> {
    const where = listQuery?.search
      ? {
          [Op.or]: [
            { name: { [Op.like]: `%${listQuery.search}%` } },
            { slug: { [Op.like]: `%${listQuery.search}%` } }
          ]
        }
      : undefined;

    const { count, rows } = await RoleModel.findAndCountAll({
      include: roleInclude,
      where,
      distinct: true,
      limit: listQuery?.limit,
      offset: listQuery?.offset,
      order: [[listQuery?.sortBy ?? "createdAt", listQuery?.sortOrder ?? "desc"]]
    });

    return {
      rows: rows.map((role) => role.toJSON() as Role),
      count
    };
  }

  async findById(id: string): Promise<Role | undefined> {
    const role = await RoleModel.findByPk(id, { include: roleInclude });
    return role?.toJSON() as Role | undefined;
  }

  async findBySlug(slug: string): Promise<Role | undefined> {
    const role = await RoleModel.findOne({
      where: { slug },
      include: roleInclude
    });

    return role?.toJSON() as Role | undefined;
  }

  async create(input: {
    name: string;
    slug: string;
    description?: string;
    permissionIds: string[];
  }): Promise<Role> {
    const role = await RoleModel.create({
      id: randomUUID(),
      name: input.name,
      slug: input.slug,
      description: input.description ?? null
    });

    if (input.permissionIds.length > 0) {
      await (role as unknown as { setPermissions: (ids: string[]) => Promise<void> }).setPermissions(
        input.permissionIds
      );
    }

    const created = await RoleModel.findByPk(role.id, { include: roleInclude });
    return created!.toJSON() as Role;
  }

  async update(
    id: string,
    input: {
      name?: string;
      slug?: string;
      description?: string | null;
      permissionIds?: string[];
    }
  ): Promise<Role | undefined> {
    const role = await RoleModel.findByPk(id, { include: roleInclude });

    if (!role) {
      return undefined;
    }

    await role.update({
      name: input.name ?? role.name,
      slug: input.slug ?? role.slug,
      description: input.description === undefined ? role.description : input.description
    });

    if (input.permissionIds) {
      await (role as unknown as { setPermissions: (ids: string[]) => Promise<void> }).setPermissions(
        input.permissionIds
      );
    }

    const updated = await RoleModel.findByPk(id, { include: roleInclude });
    return updated!.toJSON() as Role;
  }

  async delete(id: string): Promise<Role | undefined> {
    const role = await RoleModel.findByPk(id, { include: roleInclude });

    if (!role) {
      return undefined;
    }

    const snapshot = role.toJSON() as Role;
    await role.destroy();
    return snapshot;
  }
}

export const roleRepository = new RoleRepository();
