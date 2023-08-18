const { DataTypes } = require("sequelize");
const db = require("../config/db.config");
const SocialMediaToken = require("./SocialMediaToken");

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
    files: {
        type: DataTypes.TEXT,
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
    scheduledDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    deleted: {
        type: DataTypes.ENUM,
        values: ['0', '1'],
        defaultValue: '0',
    },
    deletedOn: {
        type: DataTypes.DATE,
        allowNull: true
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

// PostData.hasMany(SocialMediaToken, { as: "socialmediatocken" });


module.exports = PostData;