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

  const rows = await connection('pets')
    .leftJoin('pet_images', 'pets.id', 'pet_images.pet_id')
    .where('pets.status', 'available')
    .select(
      'pets.*',
      'pet_images.image'
    );

  const petsMap = {};

  rows.forEach(row => {

    if (!petsMap[row.id]) {
      petsMap[row.id] = {
        id: row.id,
        name: row.name,
        species: row.species,
        size: row.size,
        gender: row.gender,
        age_group: row.age_group,
        description: row.description,
        city: row.city,
        state: row.state,
        status: row.status,
        images: []
      };
    }

    if (row.image) {
      petsMap[row.id].images.push(`/uploads/${row.image}`);
    }

  });

  const pets = Object.values(petsMap);

  return res.json(pets);
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

  // Verificando se o pet pertence à ONG logada
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

  const rows = await connection('pets')
    .leftJoin('pet_images', 'pets.id', 'pet_images.pet_id')
    .where('pets.organization_id', organizationId)
    .select(
      'pets.*',
      'pet_images.image'
    );

  const petsMap = {};

  rows.forEach(row => {

    if (!petsMap[row.id]) {
      petsMap[row.id] = {
        id: row.id,
        name: row.name,
        species: row.species,
        size: row.size,
        gender: row.gender,
        age_group: row.age_group,
        description: row.description,
        city: row.city,
        state: row.state,
        status: row.status,
        organization_id: row.organization_id,
        images: []
      };
    }

    if (row.image) {
      petsMap[row.id].images.push(`/uploads/${row.image}`);
    }

  });

  const pets = Object.values(petsMap);

  return res.json(pets);
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