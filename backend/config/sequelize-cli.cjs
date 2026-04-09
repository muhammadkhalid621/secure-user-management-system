require("dotenv").config();

const shared = {
  dialect: process.env.DB_DIALECT || "mysql",
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  username: process.env.DB_USER || "sums_user",
  password: process.env.DB_PASSWORD || "sums_password",
  database: process.env.DB_NAME || "sums_db",
  seederStorage: "sequelize",
  migrationStorage: "sequelize",
  logging: process.env.DB_LOGGING === "true" ? console.log : false
};

module.exports = {
  development: shared,
  test: {
    ...shared,
    database: process.env.DB_NAME_TEST || "sums_db_test"
  },
  production: shared
};

