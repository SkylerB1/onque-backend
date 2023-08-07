const { DataTypes } = require("sequelize");
const db = require("../config/db.config");

const MediaFile = db.define("mediaFile", {
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
    files: {
        type: DataTypes.JSON,
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

module.exports = MediaFile