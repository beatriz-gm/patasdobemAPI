const express = require('express');
const routes = require('./routes');
const path = require('path');

const app = express();

app.use(express.json());
app.use(routes);
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

module.exports = app;