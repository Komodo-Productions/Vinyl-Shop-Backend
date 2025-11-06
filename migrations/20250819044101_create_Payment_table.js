/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('payment', (table) => {
    table.increments('id_payment').primary();
    table.string('order_id').notNullable();
    table.string('method').notNullable();
    table.decimal('amount', 10, 2).notNullable();
    table.date('date').notNullable();
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
