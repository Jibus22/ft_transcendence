import { rm } from 'fs/promises'
import { join } from 'path'
import { getConnection } from 'typeorm';

global.beforeEach( async () => {

	try {
		await rm(join(__dirname, '..', process.env.DB_NAME));
	}
	catch (err) {}

})

global.afterEach(async () => {
	const conn = getConnection();
	await conn.close();
})
