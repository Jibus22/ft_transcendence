const dbConfig = {
	synchronize: false,
	migrations: ['migrations/*.js'],
	cli: {
		migrationsDir: 'migrations',
	},
};

switch (process.env.NODE_ENV) {
	case 'developement':
		Object.assign(dbConfig, {
			type: 'sqlite',
			database: 'dbDev.sqlite',
			entities: ['**/*.entity.js'],
		});
		break;

	case 'test':
		Object.assign(dbConfig, {
			type: 'sqlite',
			database: 'dbTest.sqlite',
			entities: ['**/*.entity.ts'],
			migrationsRun: true,
		});
		break;

		case 'production':
			Object.assign(dbConfig, {
				type: 'postgres',
				url: process.env.DATABASE_URL,
				migrationsRun: true,
				entities: ['**/*.entity.ts'],
				ssl: {
					rejectUnauthorized: false
				},
		});
		break;

	default:
		throw new Error('unknown environnement');
}

module.exports = dbConfig;
