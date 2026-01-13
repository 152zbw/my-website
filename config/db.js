const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

/**
 * DB 连接说明：
 * - 默认使用 MySQL（与现有 .env 保持兼容）
 * - 当 DB_DIALECT=sqlite 时，强制使用 SQLite（本地开发免安装 MySQL）
 */
const dialect = (process.env.DB_DIALECT || 'mysql').toLowerCase();

let sequelize;

if (dialect === 'sqlite') {
    const dbPath = process.env.SQLITE_PATH
        ? path.resolve(process.env.SQLITE_PATH)
        : path.join(__dirname, '..', 'data', 'database.sqlite');
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });

    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: dbPath,
        logging: process.env.NODE_ENV === 'development' ? console.log : false
    });

    console.log('使用 SQLite 数据库:', dbPath);
} else {
    sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            dialect: 'mysql',
            timezone: '+08:00',
            logging: process.env.NODE_ENV === 'development' ? console.log : false,
            pool: {
                max: 10,
                min: 0,
                acquire: 30000,
                idle: 10000
            }
        }
    );
}

// 测试数据库连接（失败不强制退出，让服务器仍可启动，便于排错）
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('数据库连接成功！');
    } catch (error) {
        console.error('数据库连接失败：', error?.message || error);
    }
};

testConnection();

module.exports = sequelize;