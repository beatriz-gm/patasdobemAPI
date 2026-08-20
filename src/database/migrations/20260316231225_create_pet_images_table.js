exports.up = function(knex) {
  return knex.schema.createTable('pet_images', function(table) {

    table.increments('id').primary();

    table
      .integer('pet_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('pets')
      .onDelete('CASCADE');

    table.text('image_url').notNullable();

    table.boolean('is_primary').defaultTo(false);

    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('pet_images');
};