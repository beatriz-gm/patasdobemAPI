const express = require('express');
const routes = express.Router();

const AdminController = require('../controllers/AdminController');

routes.post('/', AdminController.create);

module.exports = routes;