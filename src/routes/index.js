const express = require('express');
const routes = express.Router();

const adminRoutes = require('./admin.routes');
const organizationRoutes = require('./organization.routes');
const petRoutes = require('./pet.routes');
const sessionRoutes = require('./session.routes');

routes.use('/admins', adminRoutes);
routes.use('/organizations', organizationRoutes);
routes.use('/pets', petRoutes);
routes.use('/sessions', sessionRoutes);

module.exports = routes;