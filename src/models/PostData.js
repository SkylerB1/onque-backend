const { DataTypes } = require("sequelize");
const db = require("../config/db.config");

const PostData = db.define("postData", {
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
    text: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    platform: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM,
        values: ['published', 'pending']
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

module.exports = PostData;