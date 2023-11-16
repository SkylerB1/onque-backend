const { DataTypes } = require("sequelize");
const db = require("../config/db.config");
const SocialMediaToken = require("./SocialMediaToken");

const Posts = db.define("posts", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  text: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  socialPresets: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  files: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  platform: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM,
    values: ["Published", "Pending","Error"],
  },
  scheduledDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  deleted: {
    type: DataTypes.ENUM,
    values: ["0", "1"],
    defaultValue: "0",
  },
  deletedOn: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});


module.exports = Posts;
