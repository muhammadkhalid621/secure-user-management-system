"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("audit_logs", {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true
      },
      actor_user_id: {
        type: Sequelize.UUID,
        allowNull: true
      },
      entity_type: {
        type: Sequelize.STRING(80),
        allowNull: false
      },
      entity_id: {
        type: Sequelize.STRING(80),
        allowNull: true
      },
      action: {
        type: Sequelize.STRING(80),
        allowNull: false
      },
      level: {
        type: Sequelize.ENUM("info", "warn", "error"),
        allowNull: false,
        defaultValue: "info"
      },
      message: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        )
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("audit_logs");
  }
};

