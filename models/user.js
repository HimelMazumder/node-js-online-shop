'use strict';

const { DataTypes } = require('sequelize');

const sequelize = require('../util/database');

const User = sequelize.define('user', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: DataTypes.STRING, 
    email: DataTypes.STRING
},
{
    tableName: 'user_seq'
});

module.exports = User;