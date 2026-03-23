const express = require('express');
const routes = express.Router();
const multer = require('multer');
const uploadConfig = require('../config/upload');

const PetController = require('../controllers/PetController');
const authMiddleware = require('../middlewares/auth');
const upload = multer(uploadConfig);

routes.post('/', authMiddleware, PetController.create);
routes.get('/', PetController.index);
routes.get('/mine', authMiddleware, PetController.myPets);
routes.put('/:id', authMiddleware, PetController.update);
routes.patch('/:id/adopt', authMiddleware, PetController.adopt)
routes.post('/:id/images', authMiddleware, upload.array('images', 5), PetController.uploadImages);
routes.delete('/images/:id', authMiddleware, PetController.deleteImage);

module.exports = routes;