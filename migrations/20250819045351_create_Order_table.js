/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('order_header', (table) => {
    table.increments('id_order_header').primary();
    table.integer('customer_id').unsigned().notNullable();
    table.decimal('total', 10, 2).notNullable();
    table.date('date_order').notNullable();
    table.string('status').notNullable();
    table.string('notes').notNullable();
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
