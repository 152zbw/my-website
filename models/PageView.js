const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

module.exports = sequelize.define('PageView', {
    day: { type: DataTypes.DATEONLY, allowNull: false },
    articleId: { type: DataTypes.INTEGER, allowNull: true },
    readerKey: { type: DataTypes.CHAR(64), allowNull: true }
}, {
    tableName: 'page_views',
    timestamps: false,
    indexes: [
        { fields: ['day'] },
        { fields: ['articleId', 'readerKey'] }
    ]
});
