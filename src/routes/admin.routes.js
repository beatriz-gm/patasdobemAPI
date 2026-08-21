const express = require('express');
const routes = express.Router();

const AdminController = require('../controllers/AdminController');
const authMiddleware = require('../middlewares/auth');
const requireRole = require('../middlewares/requireRole');

routes.post('/', authMiddleware, requireRole('admin'), AdminController.create);

module.exports = routes;