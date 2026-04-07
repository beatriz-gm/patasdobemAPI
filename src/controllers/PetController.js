const connection = require('../database/connection');
const fs = require('fs');
const path = require('path');

module.exports = {

  async create(req, res) {
  try {
    const organizationId = req.organizationId;

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

    if (
      !species ||
      !size ||
      !gender ||
      !age_group ||
      !description ||
      !city ||
      !state
    ) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios não preenchidos.'
      });
    }

    if (state.length !== 2) {
      return res.status(400).json({
        success: false,
        error: 'Estado deve conter 2 caracteres (UF).'
      });
    }

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

    return res.status(201).json({
      success: true,
      data: pet
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      error: 'Erro ao criar pet.'
    });
  }
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

  async show(req, res) {
  try {
    const { id } = req.params;

    const pet = await connection('pets')
      .where('id', id)
      .first();

    if (!pet) {
      return res.status(404).json({
        success: false,
        error: 'Pet não encontrado.'
      });
    }

    const images = await connection('pet_images')
      .where('pet_id', id)
      .select('image');

    return res.json({
      success: true,
      data: {
        ...pet,
        images: images.map(img => `/uploads/${img.image}`)
      }
    });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar pet.'
      });
    }
  },

 async update(req, res) {
  try {
    const organizationId = req.organizationId;
    const { id } = req.params;

    const pet = await connection('pets')
      .where('id', id)
      .first();

    if (!pet) {
      return res.status(404).json({
        success: false,
        error: 'Pet não encontrado.'
      });
    }

    if (pet.organization_id !== organizationId) {
      return res.status(403).json({
        success: false,
        error: 'Não autorizado.'
      });
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

    if (
      !species ||
      !size ||
      !gender ||
      !age_group ||
      !description ||
      !city ||
      !state
    ) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios não preenchidos.'
      });
    }

    if (state.length !== 2) {
      return res.status(400).json({
        success: false,
        error: 'Estado deve conter 2 caracteres (UF).'
      });
    }

    await connection('pets')
      .where('id', id)
      .update({
        name: name || null,
        species,
        size,
        gender,
        age_group,
        description,
        city,
        state: state.toUpperCase()
      });

    const updatedPet = await connection('pets')
      .where('id', id)
      .first();

    return res.json({
      success: true,
      data: updatedPet
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      error: 'Erro ao atualizar pet.'
    });
  }
},

async delete(req, res) {
  try {
    const organizationId = req.organizationId;
    const { id } = req.params;

    const pet = await connection('pets')
      .where('id', id)
      .first();

    if (!pet) {
      return res.status(404).json({
        success: false,
        error: 'Pet não encontrado.'
      });
    }

    if (pet.organization_id !== organizationId) {
      return res.status(403).json({
        success: false,
        error: 'Não autorizado.'
      });
    }

    const images = await connection('pet_images')
      .where('pet_id', id)
      .select('image');

    images.forEach(img => {
      const filePath = path.resolve(
        __dirname,
        '..',
        '..',
        'uploads',
        img.image
      );

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    await connection('pet_images')
      .where('pet_id', id)
      .delete();

    await connection('pets')
      .where('id', id)
      .delete();

    return res.json({
      success: true,
      data: {
        message: 'Pet deletado com sucesso!'
      }
    });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        error: 'Erro ao deletar pet.'
      });
    }
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
  try {
    const organizationId = req.organizationId;
    const { id } = req.params;

    const pet = await connection('pets')
      .where('id', id)
      .first();

    if (!pet) {
      return res.status(404).json({
        success: false,
        error: 'Pet não encontrado.'
      });
    }

    if (pet.organization_id !== organizationId) {
      return res.status(403).json({
        success: false,
        error: 'Não autorizado.'
      });
    }

    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Nenhuma imagem enviada.'
      });
    }

    const images = files.map(file => ({
      pet_id: id,
      image: file.filename
    }));

    await connection('pet_images').insert(images);

    return res.json({
      success: true,
      data: {
        message: 'Imagens enviadas com sucesso!'
      }
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      error: 'Erro ao enviar imagens.'
    });
    }
  },

  async deleteImage(req, res) {
  try {
    const { petId, imageId } = req.params;
    const organizationId = req.organizationId;

    const image = await connection('pet_images')
      .where('id', imageId)
      .first();

    if (!image) {
      return res.status(404).json({
        success: false,
        error: 'Imagem não encontrada.'
      });
    }

    if (image.pet_id !== Number(petId)) {
      return res.status(400).json({
        success: false,
        error: 'Imagem não pertence a este pet.'
      });
    }

    const pet = await connection('pets')
      .where('id', petId)
      .first();

    if (!pet) {
      return res.status(404).json({
        success: false,
        error: 'Pet não encontrado.'
      });
    }

    if (pet.organization_id !== organizationId) {
      return res.status(403).json({
        success: false,
        error: 'Não autorizado.'
      });
    }

    const filePath = path.resolve(
      __dirname,
      '..',
      '..',
      'uploads',
      image.image
    );

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await connection('pet_images')
      .where('id', imageId)
      .delete();

    return res.json({
      success: true,
      data: {
        message: 'Imagem deletada com sucesso!'
      }
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      error: 'Erro ao deletar imagem.'
    });
    }
  }

};