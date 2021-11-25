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

global.afterAll(async () => {
  // try {
  //   // await rm(join(dirname(process.env.DB_NAME), '/*sqlite*'));
  //   let fs = require('fs');
  //   const path = dirname(process.env.DB_NAME);
  //   let regex = /[.]sqlite[.]/;
  //   fs.readdirSync(path)
  //     .filter((f) => regex.test(f))
  //     .map((f) => fs.unlinkSync(path + f));
  // } catch (err) {}
});
