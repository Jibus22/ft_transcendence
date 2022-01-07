const dbConfig = {
  synchronize: false,
};

switch (process.env.NODE_ENV) {

  case 'debug':
  case 'dev':
    Object.assign(dbConfig,
      {
        synchronize: true,
        type: 'better-sqlite3',
        database: process.env.DB_NAME,
        factories: ['../dist/**/*.factory.js'],
        seeds: ['../dist/**/*.seed.js'],
        entities: ["../dist/**/*.entity.js"],
        migrations: ["migrations/*.ts"],
        cli: {
          "migrationsDir": "migrations",
        }
      }
    );
    break;

  case 'production':
    Object.assign(dbConfig,
      {
        type: "postgres",
        host: "database_server",
        port: 5432,
        username: process.env.POSTGRES_USER || 'admin',
        password: process.env.POSTGRES_PASSWORD || 'admin',
        database: process.env.POSTGRES_DB,
        factories: ['../dist/**/*.factory.js'],
        seeds: ['../dist/**/*.seed.js'],
        entities: ["../dist/**/*.entity.js"],
        migrations: ["migrations/*.ts"],
        cli: {
          "migrationsDir": "migrations",
        }
      }
    );
    break;

  default:
    throw new Error('🛑 Config file only designed for production or dev environnement');
}

module.exports = dbConfig;

