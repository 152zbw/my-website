const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

module.exports = sequelize.define('PageView', {
    day: { type: DataTypes.DATEONLY, allowNull: false },
    articleId: { type: DataTypes.INTEGER, allowNull: true },
    readerKey: { type: DataTypes.CHAR(64), allowNull: true },
    trafficKind: { type: DataTypes.STRING(12), allowNull: true }
}, {
    tableName: 'page_views',
    timestamps: false,
    hooks: {
        async afterSync() {
            const query = sequelize.getQueryInterface();
            const columns = await query.describeTable('page_views');
            if (!columns.trafficKind) {
                await query.addColumn('page_views', 'trafficKind', { type: DataTypes.STRING(12), allowNull: true });
            }
        }
    },
    indexes: [
        { fields: ['day'] },
        { fields: ['articleId', 'readerKey'] }
    ]
});
