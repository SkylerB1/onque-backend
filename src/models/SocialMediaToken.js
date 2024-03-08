const { DataTypes } = require("sequelize");
const db = require("../config/db.config");

const SocialMediaToken = db.define("socialmediatoken", {
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
  brandId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  screenName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  platform: {
    type: DataTypes.ENUM(
      "Twitter",
      "Facebook",
      "Facebook_Page",
      "Instagram",
      "LinkedIn",
      "LinkedIn_Page",
      "YouTube",
      "TikTok_Personal",
      "TikTok_Business",
      "Google_Business"
    ),
    allowNull: false,
  },
  credentials: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  isConnected: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
  },
});

module.exports = SocialMediaToken;
