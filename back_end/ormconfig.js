const dbConfig = {
  synchronize: false,
};

switch (process.env.NODE_ENV) {
  case 'debug':
  case 'dev':
    Object.assign(dbConfig, {
      synchronize: true,
      type: 'better-sqlite3',
      database: './app/' + (process.env.DB_NAME || 'dbDev.sqlite'),
      entities: [
        "../dist/**/*.entity.js",
      ]
    });
    break;

  case 'test':
    Object.assign(dbConfig, {
      synchronize: true,
      type: 'better-sqlite3',
      database: process.env.DB_NAME || '/tmp/dbTest.sqlite',
      entities: [
        "../dist/**/*.entity.js",
      ]
    });
    break;

  case 'production':
    Object.assign(dbConfig,
      {
        "url": "database_server:5432",
        "type": "postgres",
        "host": "database_server",
        "port": 5432,
        "admin": "admin",
        "password": "admin",
        "database": "db_production",
        "entities": [
          "../dist/**/*.entity.js",
        ],
        // "autoSchemaSync": true
      }
      // type: 'better-sqlite3',
      // database: process.env.DB_NAME || 'dbProduction.sqlite',
      // entities: ['**/*.entity.ts'],
    );
    break;

  default:
    throw new Error('unknown environnement');
}

module.exports = dbConfig;

