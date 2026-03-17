const express = require('express');
const routes = express.Router();

const OrganizationController = require('../controllers/OrganizationController');

routes.post('/', OrganizationController.create);
routes.get('/pending', OrganizationController.listPending);
routes.put('/:id/approve', OrganizationController.approve);

module.exports = routes;