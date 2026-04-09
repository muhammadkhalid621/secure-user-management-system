"use strict";

module.exports = {
  async up(queryInterface) {
    const [roles] = await queryInterface.sequelize.query(
      "SELECT id, slug FROM roles"
    );
    const [permissions] = await queryInterface.sequelize.query(
      "SELECT id, slug FROM permissions"
    );

    const roleIdBySlug = Object.fromEntries(roles.map((role) => [role.slug, role.id]));
    const permissionIdBySlug = Object.fromEntries(
      permissions.map((permission) => [permission.slug, permission.id])
    );

    const now = new Date();
    const adminPermissions = permissions.map((permission) => ({
      role_id: roleIdBySlug.admin,
      permission_id: permission.id,
      created_at: now,
      updated_at: now
    }));

    const userPermissionSlugs = [
      "auth.profile.read",
      "auth.logout",
      "users.read.own",
      "users.update.own"
    ];
    const userPermissions = userPermissionSlugs.map((slug) => ({
      role_id: roleIdBySlug.user,
      permission_id: permissionIdBySlug[slug],
      created_at: now,
      updated_at: now
    }));

    await queryInterface.bulkInsert("role_permissions", [
      ...adminPermissions,
      ...userPermissions
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("role_permissions", null, {});
  }
};

