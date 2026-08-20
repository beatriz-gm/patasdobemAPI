const connection = require('../database/connection');
const path = require('path');
const fs = require('fs');

function mapPetImages(images) {
  const map = {};

  images.forEach(img => {
    if (!map[img.pet_id]) map[img.pet_id] = [];
    map[img.pet_id].push(`/uploads/${img.image_url}`);
  });

  return map;
}

async function getPetById(id) {
  return connection('pets').where('id', id).first();
}

function checkOwnership(pet, organizationId) {
  return pet.organization_id === organizationId;
}

async function getPets({
  page = 1,
  limit = 10,
  organizationId = null,
  onlyMine = false
}) {

  const currentPage = Number(page);
  const perPage = Number(limit);
  const offset = (currentPage - 1) * perPage;

  let countQuery = connection('pets');
  let petsQuery = connection('pets');

  if (onlyMine) {
    countQuery = countQuery.where(
      'organization_id',
      organizationId
    );

    petsQuery = petsQuery.where(
      'organization_id',
      organizationId
    );
  } else {
    countQuery = countQuery.where(
      'status',
      'available'
    );

    petsQuery = petsQuery.where(
      'status',
      'available'
    );
  }

  const [{ count }] = await countQuery.count();

  const pets = await petsQuery
    .limit(perPage)
    .offset(offset)
    .orderBy('created_at', 'desc');

  const petIds = pets.map(pet => pet.id);

  const images = await connection('pet_images')
    .whereIn('pet_id', petIds)
    .select('pet_id', 'image_url');

  const imagesMap = mapPetImages(images);

  const petsWithImages = pets.map(pet => ({
    ...pet,
    images: imagesMap[pet.id] || []
  }));

  return {
    success: true,
    data: petsWithImages,
    pagination: {
      page: currentPage,
      limit: perPage,
      total: Number(count),
      hasMore: offset + pets.length < Number(count)
    }
  };
}

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
      !name ||
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
        name,
        species,
        size,
        gender,
        age_group,
        description,
        city,
        state: state.toUpperCase(),
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
    try {
    const { page = 1, limit = 10 } = req.query;

    const result = await getPets({
      page,
      limit,
      onlyMine: false
    });

    return res.json(result);

    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao listar pets.'
      });
    }
  },

  async myPets(req, res) {
    try {
    const { page = 1, limit = 10 } = req.query;

    const result = await getPets({
      page,
      limit,
      onlyMine: true,
      organizationId: req.organizationId
    });

    return res.json(result);

    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao listar pets da ONG.'
      });
    }
  },

  async show(req, res) {
    try {
      const { id } = req.params;

      const pet = await getPetById(id);

      if (!pet) {
        return res.status(404).json({
          success: false,
          error: 'Pet não encontrado.'
        });
      }

      const images = await connection('pet_images')
        .where('pet_id', id)
        .select('image_url');

      return res.json({
        success: true,
        data: {
          ...pet,
          images: images.map(img => `/uploads/${img.image_url}`)
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

      const pet = await getPetById(id);

      if (!pet) {
        return res.status(404).json({ error: 'Pet não encontrado.' });
      }

      if (!checkOwnership(pet, organizationId)) {
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

      if (
        !name ||
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
        .where({ id, organization_id: organizationId })
        .update({
          name,
          species,
          size,
          gender,
          age_group,
          description,
          city,
          state: state.toUpperCase()
        });

      const updatedPet = await getPetById(id);

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

      const pet = await getPetById(id);

      if (!pet) {
        return res.status(404).json({ error: 'Pet não encontrado.' });
      }

      if (!checkOwnership(pet, organizationId)) {
        return res.status(403).json({ error: 'Não autorizado.' });
      }

      const images = await connection('pet_images')
        .where('pet_id', id)
        .select('image_url');

      images.forEach(img => {
        const filePath = path.resolve(
          __dirname,
          '..',
          '..',
          'uploads',
          img.image_url
        );

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });

      await connection('pet_images').where('pet_id', id).delete();
      await connection('pets').where('id', id).delete();

      return res.json({
        success: true,
        data: { message: 'Pet deletado com sucesso!' }
      });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        error: 'Erro ao deletar pet.'
      });
    }
  },

  async uploadImages(req, res) {
    try {
      const organizationId = req.organizationId;
      const { id } = req.params;

      const pet = await getPetById(id);

      if (!pet) {
        return res.status(404).json({ error: 'Pet não encontrado.' });
      }

      if (!checkOwnership(pet, organizationId)) {
        return res.status(403).json({ error: 'Não autorizado.' });
      }

      const files = req.files;

      if (!files?.length) {
        return res.status(400).json({
          success: false,
          error: 'Nenhuma imagem enviada.'
        });
      }

      const images = files.map(file => ({
        pet_id: id,
        image_url: file.filename
      }));

      await connection('pet_images').insert(images);

      return res.json({
        success: true,
        data: { message: 'Imagens enviadas com sucesso!' }
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
        return res.status(404).json({ error: 'Imagem não encontrada.' });
      }

      const pet = await getPetById(petId);

      if (!pet || !checkOwnership(pet, organizationId)) {
        return res.status(403).json({ error: 'Não autorizado.' });
      }

      const filePath = path.resolve(
        __dirname,
        '..',
        '..',
        'uploads',
        image.image_url
      );

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      await connection('pet_images').where('id', imageId).delete();

      return res.json({
        success: true,
        data: { message: 'Imagem deletada com sucesso!' }
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