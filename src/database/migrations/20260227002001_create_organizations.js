exports.up = function (knex) {
  return knex.schema.createTable('organizations', function (table) {
    table.increments('id').primary();

    table.string('name').notNullable();

    table.enu('type', ['ong', 'independente']).notNullable();

    table.string('city').notNullable();
    table.string('state', 2).notNullable(); // MG, SP, RJ...

    table.string('phone').notNullable();
    table.string('instagram');

    table.string('email').notNullable().unique();
    table.string('password').notNullable();

    table.enu('status', ['pending', 'approved', 'rejected'])
      .defaultTo('pending');

    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('organizations');
};