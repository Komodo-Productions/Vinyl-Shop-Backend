module.exports = {
    development: {
        client: 'mysql2',
        connection: {
            host: '127.0.0.1',
            port:'3307',
            user: 'root',
            password: '1186023DEHG',
            database: 'KomodoDB'
        },
        migrations: {
            directory: './migrations'
        }
    }
};
