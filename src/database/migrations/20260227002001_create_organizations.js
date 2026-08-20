exports.up = function (knex) {
  return knex.schema.createTable('organizations', function (table) {
    table.increments('id').primary();

    table.string('name').notNullable();

    table.enu('type', ['ong', 'independente']).notNullable();
    table.text('description');

    table.string('city').notNullable();
    table.string('state', 2).notNullable(); // MG, SP, RJ...

    table.string('phone').notNullable();
    table.string('social_links');

    table.string('email').notNullable().unique();
    table.string('password_hash').notNullable();

    table.enu('status', ['pending', 'approved', 'rejected'])
      .defaultTo('pending');

    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('organizations');
};