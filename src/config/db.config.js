const Sequelize = require("sequelize");

const db = new Sequelize("jjmedia_fe", "root", "", {
  host: "localhost",
  dialect: "mysql",
  logging: false
});

module.exports = db;