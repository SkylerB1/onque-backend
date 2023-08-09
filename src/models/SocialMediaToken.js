const { DataTypes } = require("sequelize");
const db = require("../config/db.config");

const SocialMediaToken = db.define("socialmediatocken", {
    id: {
        type: DataTypes.STRING,
        allowNull: true,
        primaryKey: true,
    },
    // username: {
    //   type: DataTypes.STRING,
    //     allowNull: false
    // },
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
