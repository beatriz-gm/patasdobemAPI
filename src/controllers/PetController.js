const connection = require('../database/connection');

module.exports = {

  async create(req, res) {
  const organization_id = req.shelterId;

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
      organization_id
    })
    .returning('*');

  return res.json(pet);
  },

  async index(req, res) {
    const pets = await connection('pets')
      .where('status', 'available');

    return res.json(pets);
  },

  async update(req, res) {
  const organization_id = req.shelterId;
  const { id } = req.params;

  const pet = await connection('pets')
    .where('id', id)
    .first();

  if (!pet) {
    return res.status(404).json({ error: 'Pet não encontrado.' });
  }

  // Verificando se o pet pertence à ONG logada
  if (pet.organization_id !== organization_id) {
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
  const organization_id = req.shelterId;

  const pets = await connection('pets')
    .where('organization_id', organization_id);

  return res.json(pets);
},

async adopt(req, res) {
  const organization_id = req.shelterId;
  const { id } = req.params;

  const pet = await connection('pets')
    .where('id', id)
    .first();

  if (!pet) {
    return res.status(404).json({ error: 'Pet não encontrado.' });
  }

  if (pet.organization_id !== organization_id) {
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
  const organization_id = req.shelterId;
  const { id } = req.params;

  const pet = await connection('pets')
    .where('id', id)
    .first();

  if (!pet) {
    return res.status(404).json({ error: 'Pet não encontrado.' });
  }

  if (pet.organization_id !== organization_id) {
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
}

};