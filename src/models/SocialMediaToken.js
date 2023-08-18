const { DataTypes } = require("sequelize");
const db = require("../config/db.config");
const PostData = require("./PostData");

const SocialMediaToken = db.define("socialmediatocken", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  platform: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  access_token: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  access_secret: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
});



module.exports = SocialMediaToken;
