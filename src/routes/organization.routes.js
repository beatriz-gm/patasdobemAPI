const express = require('express');
const routes = express.Router();

const OrganizationController = require('../controllers/OrganizationController');
const authMiddleware = require('../middlewares/auth');
const requireRole = require('../middlewares/requireRole');

routes.post('/', OrganizationController.create);
routes.get('/pending', authMiddleware, requireRole('admin'), OrganizationController.listPending);
routes.put('/:id/approve', authMiddleware, requireRole('admin'), OrganizationController.approve);

module.exports = routes;