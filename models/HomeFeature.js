const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // 更正数据库配置文件路径

const HomeFeature = sequelize.define('HomeFeature', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  icon: {
    type: DataTypes.STRING, // 例如：'linearicons-pie-chart'
    allowNull: true,
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'home_features',
  timestamps: true,
  underscored: true,
});

module.exports = HomeFeature;
