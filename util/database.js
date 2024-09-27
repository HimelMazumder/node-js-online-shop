'use strict';

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('node_complete', 'Kratu', '8420', {
    dialect: 'postgres',
    host: 'localhost'
});

module.exports = sequelize;