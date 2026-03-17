exports.up = function(knex) {
  return knex.schema.createTable('pet_images', function(table) {
    table.increments('id').primary();
    table.integer('pet_id').references('id').inTable('pets').onDelete('CASCADE');
    table.text('image').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('pet_images');
};