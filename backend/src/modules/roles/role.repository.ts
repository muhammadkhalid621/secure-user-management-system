import { randomUUID } from "node:crypto";
import { Op } from "sequelize";
import { PermissionModel } from "../../database/models/permission.model.js";
import { RoleModel } from "../../database/models/role.model.js";
import type { ListQuery } from "../../lib/list-query.js";
import {
  createWithRelations,
  deleteAndReturn,
  updateWithRelations
} from "../../lib/sequelize-relation-helpers.js";
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
    return createWithRelations({
      create: () =>
        RoleModel.create({
          id: randomUUID(),
          name: input.name,
          slug: input.slug,
          description: input.description ?? null
        }),
      findByPk: (roleId, options) => RoleModel.findByPk(roleId, options),
      include: roleInclude,
      relationSetterName: "setPermissions",
      relationIds: input.permissionIds,
      map: (role) => role.toJSON() as Role
    });
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

    return updateWithRelations({
      id,
      findByPk: (roleId, options) => RoleModel.findByPk(roleId, options),
      include: roleInclude,
      attributes: {
        name: input.name ?? role.name,
        slug: input.slug ?? role.slug,
        description:
          input.description === undefined ? role.description : input.description
      },
      relationSetterName: "setPermissions",
      relationIds: input.permissionIds,
      map: (updatedRole) => updatedRole.toJSON() as Role
    });
  }

  async delete(id: string): Promise<Role | undefined> {
    return deleteAndReturn({
      id,
      findByPk: (roleId, options) => RoleModel.findByPk(roleId, options),
      include: roleInclude,
      map: (role) => role.toJSON() as Role
    });
  }
}

export const roleRepository = new RoleRepository();
