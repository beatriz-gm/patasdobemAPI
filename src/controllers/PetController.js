const connection = require('../database/connection');
const fs = require('fs');
const path = require('path');

module.exports = {

  async create(req, res) {
  const organizationId  = req.organizationId;

  const {
    name,
    species,
    size,
    gender,
    age_group,
    description,
    city,
    state
  } = req.body;

  const [pet] = await connection('pets')
    .insert({
      name: name || null,
      species,
      size,
      gender,
      age_group,
      description,
      city,
      state,
      organization_id: organizationId 
    })
    .returning('*');

  return res.json(pet);
  },

  async index(req, res) {
  const { page = 1, limit = 10 } = req.query;

  const currentPage = Number(page);
  const perPage = Number(limit);

  const offset = (currentPage - 1) * perPage;

  const [{ count }] = await connection('pets')
    .where('status', 'available')
    .count();

  const pets = await connection('pets')
    .where('status', 'available')
    .limit(perPage)
    .offset(offset)
    .orderBy('created_at', 'desc');

  const petIds = pets.map(pet => pet.id);

  const images = await connection('pet_images')
    .whereIn('pet_id', petIds)
    .select('pet_id', 'image');

  const imagesMap = {};

  images.forEach(img => {
    if (!imagesMap[img.pet_id]) {
      imagesMap[img.pet_id] = [];
    }

    imagesMap[img.pet_id].push(`/uploads/${img.image}`);
  });

  const petsWithImages = pets.map(pet => ({
    ...pet,
    images: imagesMap[pet.id] || []
  }));

  return res.json({
    success: true,
    data: petsWithImages,
    pagination: {
      page: currentPage,
      limit: perPage,
      total: Number(count),
      hasMore: offset + pets.length < Number(count)
    }
  });
},

  async update(req, res) {
  const organizationId = req.organizationId;
  const { id } = req.params;

  const pet = await connection('pets')
    .where('id', id)
    .first();

  if (!pet) {
    return res.status(404).json({ error: 'Pet não encontrado.' });
  }

  if (pet.organization_id !== organizationId) {
    return res.status(403).json({ error: 'Não autorizado.' });
  }

  const {
    name,
    species,
    size,
    gender,
    age_group,
    description,
    city,
    state
  } = req.body;

  await connection('pets')
    .where('id', id)
    .update({
      name,
      species,
      size,
      gender,
      age_group,
      description,
      city,
      state
    });

  return res.json({ message: 'Pet atualizado com sucesso!' });
},

async myPets(req, res) {
  const organizationId = req.organizationId;
  const { page = 1, limit = 10 } = req.query;

  const currentPage = Number(page);
  const perPage = Number(limit);

  const offset = (currentPage - 1) * perPage;

  const [{ count }] = await connection('pets')
    .where('organization_id', organizationId)
    .count();

  const pets = await connection('pets')
    .where('organization_id', organizationId)
    .limit(perPage)
    .offset(offset)
    .orderBy('created_at', 'desc');

  const petIds = pets.map(pet => pet.id);

  const images = await connection('pet_images')
    .whereIn('pet_id', petIds)
    .select('pet_id', 'image');

  const imagesMap = {};

  images.forEach(img => {
    if (!imagesMap[img.pet_id]) {
      imagesMap[img.pet_id] = [];
    }

    imagesMap[img.pet_id].push(`/uploads/${img.image}`);
  });

  const petsWithImages = pets.map(pet => ({
    ...pet,
    images: imagesMap[pet.id] || []
  }));

  return res.json({
    success: true,
    data: petsWithImages,
    pagination: {
      page: currentPage,
      limit: perPage,
      total: Number(count),
      hasMore: offset + pets.length < Number(count)
    }
  });
},

async adopt(req, res) {
  const organizationId = req.organizationId;
  const { id } = req.params;

  const pet = await connection('pets')
    .where('id', id)
    .first();

  if (!pet) {
    return res.status(404).json({ error: 'Pet não encontrado.' });
  }

  if (pet.organization_id !== organizationId) {
    return res.status(403).json({ error: 'Não autorizado.' });
  }

  await connection('pets')
    .where('id', id)
    .update({
      status: 'adopted'
    });

  return res.json({ message: 'Pet marcado como adotado!' });
}, 

async uploadImages(req, res) {
  const organizationId = req.organizationId;
  const { id } = req.params;

  const pet = await connection('pets')
    .where('id', id)
    .first();

  if (!pet) {
    return res.status(404).json({ error: 'Pet não encontrado.' });
  }

  if (pet.organization_id !== organizationId) {
    return res.status(403).json({ error: 'Não autorizado.' });
  }

  const files = req.files;

  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'Nenhuma imagem enviada.' });
  }

  const images = files.map(file => ({
    pet_id: id,
    image: file.filename
  }));

  await connection('pet_images').insert(images);

  return res.json({
    message: 'Imagens enviadas com sucesso!'
  });
},

async deleteImage(req, res) {

  const organizationId = req.organizationId;
  const { id } = req.params;

  const image = await connection('pet_images')
    .where('id', id)
    .first();

  if (!image) {
    return res.status(404).json({ error: 'Imagem não encontrada.' });
  }

  const pet = await connection('pets')
    .where('id', image.pet_id)
    .first();

  if (pet.organization_id !== organizationId) {
    return res.status(403).json({ error: 'Não autorizado.' });
  }

  await connection('pet_images')
    .where('id', id)
    .delete();

  const filePath = path.resolve(
    __dirname,
    '..',
    '..',
    'uploads',
    image.image
  );

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('Erro ao deletar arquivo:', err);
    }
  });

  return res.json({ message: 'Imagem deletada com sucesso!' });
}

};