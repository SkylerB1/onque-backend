const db = require("../config/db.config");

// Import all models here for sync
require("./Users");
require("./SocialMediaToken")
require("./TwitterPostData")

db.sync({alter: false}).then(() => {
    console.log('db connected');
}).catch((error) => {
    console.error('Unable to sync table : ', error);
});

module.exports = db;