const Sequelize = require("sequelize");
const { DB_NAME, DB_USERNAME, DB_PASS, DIALECT, DB_HOST } = process.env;

const db = new Sequelize(DB_NAME, DB_USERNAME, DB_PASS, {
  host: DB_HOST,
  dialect: DIALECT,
  logging: false,
});

module.exports = db;
