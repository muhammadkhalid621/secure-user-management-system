import { Sequelize } from "sequelize";
import { config } from "../config.js";

export const sequelize = new Sequelize(config.db.name, config.db.user, config.db.password, {
  dialect: "mysql",
  host: config.db.host,
  port: config.db.port,
  logging: config.db.logging ? console.log : false,
  pool: {
    max: config.db.pool.max,
    min: config.db.pool.min,
    acquire: config.db.pool.acquire,
    idle: config.db.pool.idle
  }
});

