const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const BusinessDistribution = sequelize.define('BusinessDistribution', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(100), allowNull: false, defaultValue: '业务分布' },
  subtitle: { type: DataTypes.STRING(255), defaultValue: '' },
  logo: { type: DataTypes.STRING(255), defaultValue: '' },
  mapImage: { type: DataTypes.STRING(255), defaultValue: '' },
  points: { type: DataTypes.TEXT('long'), allowNull: false, defaultValue: '[]' },
  isActive: { type: DataTypes.TINYINT, field: 'is_active', defaultValue: 1 },
  createdAt: { type: DataTypes.DATE, field: 'created_at', defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, field: 'updated_at', defaultValue: DataTypes.NOW }
}, {
  tableName: 'business_distribution',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci'
});

module.exports = BusinessDistribution;
