"use strict";

const crypto = require("node:crypto");

const roles = [
  ["Administrator", "admin", "Full system administrator access"],
  ["User", "user", "Default application user access"]
];

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert(
      "roles",
      roles.map(([name, slug, description]) => ({
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
    await queryInterface.bulkDelete("roles", {
      slug: roles.map(([, slug]) => slug)
    });
  }
};

