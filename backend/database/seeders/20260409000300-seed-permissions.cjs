"use strict";

const crypto = require("node:crypto");

const permissions = [
  ["Profile Read", "auth.profile.read", "Read authenticated profile"],
  ["Logout", "auth.logout", "Logout the current session"],
  ["Create Users", "users.create", "Create users"],
  ["Read Users", "users.read", "Read all users"],
  ["Read Own User", "users.read.own", "Read own user profile"],
  ["Update Users", "users.update", "Update any user"],
  ["Update Own User", "users.update.own", "Update own user profile"],
  ["Delete Users", "users.delete", "Delete users"],
  ["Create Roles", "roles.create", "Create roles"],
  ["Read Roles", "roles.read", "Read roles"],
  ["Update Roles", "roles.update", "Update roles"],
  ["Delete Roles", "roles.delete", "Delete roles"],
  ["Read Permissions", "permissions.read", "Read permissions catalog"]
];

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert(
      "permissions",
      permissions.map(([name, slug, description]) => ({
        id: crypto.randomUUID(),
        name,
        slug,
        description,
        created_at: now,
        updated_at: now
      }))
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("permissions", {
      slug: permissions.map(([, slug]) => slug)
    });
  }
};

