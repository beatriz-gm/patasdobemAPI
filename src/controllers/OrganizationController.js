const connection = require('../database/connection');
const bcrypt = require('bcrypt');

module.exports = {

  async create(req, res) {
    const {
      name,
      type,
      city,
      state,
      phone,
      instagram,
      email,
      password
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

  const [organization] = await connection('organizations')
  .insert({
    name,
    type,
    city,
    state,
    phone,
    instagram,
    email,
    password: hashedPassword,
    status: 'pending'
  })
  .returning('id');

  return res.json({ 
    message: 'Cadastro aguardando aprovação.',
    id: organization.id
  });
  },

  async listPending(req, res) {
    const organizations = await connection('organizations')
      .where('status', 'pending');

    return res.json(organizations);
  },

  async approve(req, res) {
    const { id } = req.params;

    await connection('organizations')
      .where('id', id)
      .update({ status: 'approved' });

    return res.json({ message: 'Organização aprovada.' });
  }

};