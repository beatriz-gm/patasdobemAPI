exports.up = function (knex) {
  return knex.schema.createTable('pets', function (table) {

    table.increments('id').primary();

    table
      .integer('organization_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('organizations')
      .onDelete('CASCADE');

    table.string('name').notNullable();

    table.enu('species', ['Dog', 'Cat'])
      .notNullable();

    table.enu('size', ['Small', 'Medium', 'Large'])
      .notNullable();

    table.enu('gender', ['Male', 'Female'])
      .notNullable();

    table.enu('age_group', [
      'Kitten (<1 year)',
      'Young (1-4 years)',
      'Adult (5-9 years)',
      'Senior (10+ years)'
    ]).notNullable();

    table.text('description').notNullable();

    table.string('city').notNullable();

    table.string('state', 2).notNullable(); // MG, SP, RJ...

    table.enu('status', [
      'available',
      'in_process',
      'adopted'
    ]).defaultTo('available');

    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('pets');
};