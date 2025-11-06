/**
 * @param { import("knex").Knex } knex
 * @returns {Knex.SchemaBuilder}
 */
exports.up = function(knex) {
  return knex.schema.createTable('user', (table) => {
    table.increments('id_user').primary();
    table.string('name').notNullable();
    table.string('last_name').notNullable();
    table.string('phone');
    table.string('email').unique().notNullable();
    table.string('password').notNullable();
    table.timestamps(true, true);
    table.timestamp('deleted_at').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns {Knex.SchemaBuilder}
 */
exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
