const Sequelize = require("sequelize");

const db = new Sequelize("jjmedia_fe", "root", "", {
  host: process.env.HOST,
  dialect: "mysql"
});

db.authenticate().then(() => {  
  console.log('DB connected successfully...');
}).catch((error) => {
  console.error('Unable to connect to the database: ', error);
});

module.exports = db;