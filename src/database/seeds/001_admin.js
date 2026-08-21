const bcrypt = require('bcrypt');

exports.seed = async function (knex) {
  const name = process.env.ADMIN_SEED_NAME;
  const email = process.env.ADMIN_SEED_EMAIL;
  const password = process.env.ADMIN_SEED_PASSWORD;

  if (!name || !email || !password) {
    console.log('ADMIN_SEED_NAME/EMAIL/PASSWORD não definidos no .env — seed de admin ignorado.');
    return;
  }

  const existing = await knex('admins').where('email', email).first();

  if (existing) {
    console.log(`Admin ${email} já existe, seed ignorado.`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await knex('admins').insert({ name, email, password: hashedPassword });

  console.log(`Admin ${email} criado via seed.`);
};
