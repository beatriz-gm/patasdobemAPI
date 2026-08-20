const connection = require('../database/connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = {

  async loginAdmin(req, res) {
    const { email, password } = req.body;

    const admin = await connection('admins')
      .where('email', email)
      .first();

    if (!admin) {
      return res.status(400).json({ error: 'Admin não encontrado' });
    }

    const passwordMatch = await bcrypt.compare(password, admin.password);

    if (!passwordMatch) {
      return res.status(400).json({ error: 'Usuário ou senha inválida' });
    }

    const token = jwt.sign(
      { id: admin.id, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return res.json({ admin: { id: admin.id, name: admin.name }, token });
  },

  async loginOrganization(req, res) {
    const { email, password } = req.body;

    const organization = await connection('organizations')
      .where('email', email)
      .first();

    if (!organization) {
      return res.status(400).json({ error: 'Organização não encontrada' });
    }

    if (organization.status !== 'approved') {
      return res.status(403).json({ error: 'Conta ainda não aprovada.' });
    }

    const passwordMatch = await bcrypt.compare(password, organization.password_hash);

    if (!passwordMatch) {
      return res.status(400).json({ error: 'Usuário ou senha inválida' });
    }

    const token = jwt.sign(
      { id: organization.id, role: 'organization' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return res.json({
      organization: { id: organization.id, name: organization.name },
      token
    });
  }

};