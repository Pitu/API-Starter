const randomstring = require('randomstring');
const jetpack = require('fs-jetpack');
const qoa = require('qoa');
qoa.config({
	prefix: '>',
	underlineQuery: false
});

async function start() {
	console.log();
	console.log('===============================================================');
	console.log('You can manually edit .env file after the wizard to edit values');
	console.log('===============================================================');
	console.log();

	const wizard = [
		{
			type: 'input',
			query: 'Service name:',
			handle: 'SERVICE_NAME'
		},
		{
			type: 'input',
			query: 'Port to run the API in:',
			handle: 'SERVER_PORT'
		},
		{
			type: 'input',
			query: 'Route prefix (Leave blank if you want to mount on /):',
			handle: 'ROUTE_PREFIX'
		},
		{
			type: 'input',
			query: 'Name of the admin account:',
			handle: 'ADMIN_ACCOUNT'
		},
		{
			type: 'secure',
			query: 'Type a secure password for the admin account:',
			handle: 'ADMIN_PASSWORD'
		},
		{
			type: 'interactive',
			query: 'Which predefined database do you want to use?',
			handle: 'DB_CLIENT',
			symbol: '>',
			menu: [
				'pg',
				'sqlite3'
			]
		},
		{
			type: 'input',
			query: 'Database host (Ignore if you selected sqlite3):',
			handle: 'DB_HOST'
		},
		{
			type: 'input',
			query: 'Database user (Ignore if you selected sqlite3):',
			handle: 'DB_USER'
		},
		{
			type: 'input',
			query: 'Database password (Ignore if you selected sqlite3):',
			handle: 'DB_PASSWORD'
		},
		{
			type: 'input',
			query: 'Database name (Ignore if you selected sqlite3):',
			handle: 'DB_DATABASE'
		}
	];

	const response = await qoa.prompt(wizard);
	let envfile = '';

	const defaultSettings = {
		RATE_LIMIT_WINDOW: 2,
		RATE_LIMIT_MAX: 5,
		SECRET: randomstring.generate(64)
	};

	const allSettings = Object.assign(defaultSettings, response);

	const keys = Object.keys(allSettings);
	for (const item of keys) {
		envfile += `${item}=${allSettings[item]}\n`;
	}
	jetpack.write('.env', envfile);

	console.log();
	console.log('=============================================');
	console.log('==    .env file generated successfully.    ==');
	console.log('=============================================');
	console.log();
}

start();
