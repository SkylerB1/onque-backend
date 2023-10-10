const { DataTypes } = require("sequelize");
const db = require("../config/db.config");

const Users = db.define("users", {
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
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
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

module.exports = Users;

