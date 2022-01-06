const dbConfig = {
  synchronize: false,
};

switch (process.env.NODE_ENV) {

  case 'production':
    Object.assign(dbConfig,
      {
        type: "postgres",
        host: "database_server",
        port: 5432,
        username: process.env.POSTGRES_USER || 'admin',
        password: process.env.POSTGRES_PASSWORD || 'admin',
        database: "db_production",
        entities: ["../dist/**/*.entity.js"],
        migrations: ["migrations/*.ts"],
        cli: {
          "migrationsDir": "migrations",
        }
      }
    );
    break;

  default:
    throw new Error('Config file only designed for production environnement');
}

module.exports = dbConfig;

