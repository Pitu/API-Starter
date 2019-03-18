exports.up = async knex => {
	await knex.schema.createTable('users', table => {
		table.increments();
		table.string('uuid');
		table.string('username');
		table.text('password');
		table.boolean('enabled');
		table.boolean('isAdmin');
		table.timestamp('passwordEditedAt');
		table.timestamp('apiKeyEditedAt');
		table.timestamp('createdAt');
		table.timestamp('editedAt');
	});
};
exports.down = async knex => {
	await knex.schema.dropTableIfExists('users');
};
