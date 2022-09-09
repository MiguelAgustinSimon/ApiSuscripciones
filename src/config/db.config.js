const Sequelize = require("sequelize");

let dbConfig = {
  HOST: "syserrepar-pg-devqa-db-01.chbngkghfvhl.us-east-2.rds.amazonaws.com",
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