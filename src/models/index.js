const db = require("../config/db.config");

// Import all models here for sync
const users = require("./Users");
const socialTokens = require("./SocialMediaToken");
const Posts = require("./Posts");
const brands = require("./brands")

users.hasMany(socialTokens, {
  foreignKey: "userId",
  as: "users",
});

brands.hasMany(socialTokens, {
  foreignKey: "brandId",
  as: "socialTokens",
});

socialTokens.belongsTo(brands)



db.sync({ alter: true })
  .then(() => {
    console.log("db connected");
  })
  .catch((error) => {
    console.error("Unable to sync table : ", error);
  });

module.exports = db;
