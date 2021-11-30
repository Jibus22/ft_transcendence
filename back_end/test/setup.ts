import { rm } from 'fs/promises'
import { join } from 'path'
import { dirname } from 'path/posix';
import { getConnection } from 'typeorm';

global.beforeEach( async () => {

  try {
    await rm(process.env.DB_NAME);
	}
	catch (err) {}

})

global.afterEach(async () => {
	const conn = getConnection();
	await conn.close();
})
