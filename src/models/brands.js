const { DataTypes } = require("sequelize");
const db = require("../config/db.config");

const Brands = db.define("brands", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  brand_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  brand_file: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  is_active: {
    type: DataTypes.ENUM,
    values: ["0", "1"],
    defaultValue: "0",    
  }
}, {
  tableName: "brands",
  timestamps: true
});

module.exports = Brands;