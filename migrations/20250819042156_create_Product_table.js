/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
   return knex.schema.createTable('product', (table) => {
    table.increments('id_product').primary();
    table.string('name').notNullable();
    table.string('artist').notNullable();
    table.string('publication_date');
    table.integer('genre_id').unsigned().notNullable();
    table.decimal('price', 10, 2).notNullable();
    table.string('description');
    table.timestamps(true, true);
    table.timestamp('deleted_at').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
