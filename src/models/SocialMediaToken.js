const { DataTypes } = require("sequelize");
const db = require("../config/db.config");

const SocialMediaToken = db.define("socialmediatocken", {
    id: {
        type: DataTypes.STRING,
        allowNull: true,
        primaryKey: true,
    },
    platform: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    oauth_token: {
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
