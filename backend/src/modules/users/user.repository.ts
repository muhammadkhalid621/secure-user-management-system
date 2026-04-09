import { randomUUID } from "node:crypto";
import { Op } from "sequelize";
import { PermissionModel } from "../../database/models/permission.model.js";
import { RoleModel } from "../../database/models/role.model.js";
import { UserModel } from "../../database/models/user.model.js";
import type { ListQuery } from "../../lib/list-query.js";
import {
  createWithRelations,
  deleteAndReturn,
  updateWithRelations
} from "../../lib/sequelize-relation-helpers.js";
import type { User } from "./user.types.js";

const userInclude = [
  {
    model: RoleModel,
    as: "roles",
    through: { attributes: [] as string[] },
    include: [
      {
        model: PermissionModel,
        as: "permissions",
        through: { attributes: [] as string[] }
      }
    ]
  }
];

const mapUser = (user: UserModel): User => {
  const json = user.toJSON() as UserModel & {
    roles?: Array<{
      id: string;
      name: string;
      slug: string;
      permissions?: Array<{ id: string; name: string; slug: string; description: string | null }>;
    }>;
  };

  const roles = (json.roles ?? []).map((role) => ({
    id: role.id,
    name: role.name,
    slug: role.slug
  }));
  const permissions = Array.from(
    new Set(
      (json.roles ?? []).flatMap((role) =>
        (role.permissions ?? []).map((permission) => permission.slug)
      )
    )
  );

  return {
    id: json.id,
    name: json.name,
    email: json.email,
    passwordHash: json.passwordHash,
    roles,
    permissions,
    createdAt: json.createdAt,
    updatedAt: json.updatedAt
  };
};

class UserRepository {
  async findAll(
    listQuery?: ListQuery
  ): Promise<{ rows: User[]; count: number }> {
    const where = listQuery?.search
      ? {
          [Op.or]: [
            { name: { [Op.like]: `%${listQuery.search}%` } },
            { email: { [Op.like]: `%${listQuery.search}%` } }
          ]
        }
      : undefined;

    const roleFilter = listQuery?.filters.role;
    const { count, rows } = await UserModel.findAndCountAll({
      include: userInclude,
      where,
      distinct: true,
      limit: listQuery?.limit,
      offset: listQuery?.offset,
      order: [[listQuery?.sortBy ?? "createdAt", listQuery?.sortOrder ?? "desc"]],
      ...(roleFilter
        ? {
            include: [
              {
                ...userInclude[0],
                where: { slug: roleFilter }
              }
            ]
          }
        : {})
    });

    return {
      rows: rows.map(mapUser),
      count
    };
  }

  async findById(id: string): Promise<User | undefined> {
    const user = await UserModel.findByPk(id, { include: userInclude });
    return user ? mapUser(user) : undefined;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ where: { email }, include: userInclude });
    return user ? mapUser(user) : undefined;
  }

  async create(input: {
    name: string;
    email: string;
    passwordHash: string;
    roleIds?: string[];
  }): Promise<User> {
    return createWithRelations({
      create: () =>
        UserModel.create({
          id: randomUUID(),
          name: input.name,
          email: input.email,
          passwordHash: input.passwordHash
        }),
      findByPk: (userId, options) => UserModel.findByPk(userId, options),
      include: userInclude,
      relationSetterName: "setRoles",
      relationIds: input.roleIds,
      map: mapUser
    });
  }

  async update(
    id: string,
    input: {
      name?: string;
      email?: string;
      roleIds?: string[];
    }
  ): Promise<User | undefined> {
    const current = await UserModel.findByPk(id, { include: userInclude });

    if (!current) {
      return undefined;
    }

    return updateWithRelations({
      id,
      findByPk: (userId, options) => UserModel.findByPk(userId, options),
      include: userInclude,
      attributes: {
        name: input.name ?? current.name,
        email: input.email ?? current.email
      },
      relationSetterName: "setRoles",
      relationIds: input.roleIds,
      map: mapUser
    });
  }

  async delete(id: string): Promise<User | undefined> {
    return deleteAndReturn({
      id,
      findByPk: (userId, options) => UserModel.findByPk(userId, options),
      include: userInclude,
      map: mapUser
    });
  }
}

export const userRepository = new UserRepository();
