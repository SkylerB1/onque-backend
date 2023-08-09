const Sequelize = require("sequelize");
const environment = require("../config/db.config.json");


DB_NAME = environment.development.database;
USER_NAME = environment.development.username;
PASSWORD = environment.development.password;
HOST = environment.development.host;
DIALECT = environment.development.dialect;
LOGGING = environment.development.logging;

const db = new Sequelize(DB_NAME, USER_NAME, PASSWORD, {
  host: HOST,
  dialect: DIALECT,
});

module.exports = db;