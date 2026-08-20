const connection = require('../database/connection');
const bcrypt = require('bcrypt');

module.exports = {

  async create(req, res) {
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const [admin] = await connection('admins')
      .insert({
        name,
        email,
        password: hashedPassword
      })
      .returning('id');

    return res.json({ id: admin.id });
  },

  async index(req, res) {
    const admins = await connection('admins')
      .select('id', 'name', 'email', 'created_at');

    return res.json(admins);
  }

};