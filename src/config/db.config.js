const Sequelize = require("sequelize");

let dbConfig = {
  HOST: "pg-prod-cross-01.c0wgtvsprq2l.us-east-1.rds.amazonaws.com",
  USER: "dev_user",
  PASSWORD: "dev",
  DB: "pg_dev_01",
  dialect: "postgres",
};

const db = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  logging: false,
});

module.exports = db;
