const { DataTypes } = require("sequelize");
const db = require("../config/db.config");

const SocialMediaToken = db.define("socialmediatocken", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  screenName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  platform: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  accessToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  accessSecret: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

module.exports = SocialMediaToken;
