"use strict";

module.exports = {
  async up(queryInterface) {
    const [users] = await queryInterface.sequelize.query(
      "SELECT id, email FROM users WHERE email = 'admin@example.com'"
    );
    const [roles] = await queryInterface.sequelize.query(
      "SELECT id, slug FROM roles WHERE slug = 'admin'"
    );

    if (!users[0] || !roles[0]) {
      return;
    }

    const now = new Date();

    await queryInterface.bulkInsert("user_roles", [
      {
        user_id: users[0].id,
        role_id: roles[0].id,
        created_at: now,
        updated_at: now
      }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("user_roles", null, {});
  }
};
