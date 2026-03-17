const express = require('express');
const routes = express.Router();

const SessionController = require('../controllers/SessionController');

routes.post('/admin', SessionController.loginAdmin);
routes.post('/organization', SessionController.loginOrganization);

module.exports = routes;