exports.up = function(knex) {
  return knex.schema.createTable('pet_interactions', (table) => {
    table.increments('id').primary();

    table
      .integer('pet_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('pets')
      .onDelete('CASCADE');

    table
      .enu('interaction_type', [
        'view_details',
        'adoption_interest'
      ])
      .notNullable();

    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('pet_interactions');
};