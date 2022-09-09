const Sequelize = require("sequelize");

let dbConfig = {
  HOST: process.env.POSTGRESQL_HOST,
  USER: process.env.POSTGRESQL_USER,
  PASSWORD: process.env.POSTGRESQL_PASS,
  DB: process.env.POSTGRESQL_NAME,
  dialect: "postgres",
};

const db = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  logging: false,
});

module.exports = db;

