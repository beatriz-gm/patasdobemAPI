require('dotenv').config()

module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: '127.0.0.1',
      port: 5432,
      user: 'postgres',
      password: 'aloromora12345',
      database: 'patas_do_bem'
    },
    migrations: {
      directory: './src/database/migrations'
    }
  }
}