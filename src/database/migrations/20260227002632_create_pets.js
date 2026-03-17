exports.up = function (knex) {
  return knex.schema.createTable('pets', function (table) {
    table.increments('id').primary();
    table.string('name');
    table.enu('species', ['Cachorro', 'Gato'])
      .notNullable();

    table.enu('size', ['Pequeno', 'Médio', 'Grande'])
      .notNullable();

    table.enu('gender', ['Macho', 'Fêmea'])
      .notNullable();

    table.enu('age_group', [
      'Filhote (<1 ano)',
      'Jovem (1-4 anos)',
      'Adulto (5-9 anos)',
      'Idoso (10+ anos)'
    ]).notNullable();

    table.text('description').notNullable();

    table.string('city').notNullable();
    table.string('state', 2).notNullable();

    table.enu('status', ['available', 'adopted'])
      .defaultTo('available');

    table
      .integer('organization_id')
      .unsigned()
      .references('id')
      .inTable('organizations')
      .onDelete('CASCADE');

    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('pets');
};