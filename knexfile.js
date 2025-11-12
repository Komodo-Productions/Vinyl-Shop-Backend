require('dotenv').config();

module.exports = {
    client: 'mysql2',
    connection: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    },
    migrations: {
        tableName: 'knex_migrations',
        directory: './migrations'
    }
};
