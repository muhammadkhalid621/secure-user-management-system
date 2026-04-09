"use strict";

const crypto = require("node:crypto");

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
};

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert("users", [
      {
        id: crypto.randomUUID(),
        name: "System Admin",
        email: "admin@example.com",
        password_hash: hashPassword("Admin123!"),
        created_at: now,
        updated_at: now
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      "users",
      {
        email: "admin@example.com"
      },
      {}
    );
  }
};

