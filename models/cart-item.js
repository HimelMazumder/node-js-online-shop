"use strict";

const { DataTypes } = require('sequelize');

const sequelize = require('../util/database');

const CartItem = sequelize.define("cartItem", 
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        quantity: DataTypes.INTEGER
    },
    {
        tableName: 'cart_seq_item'
    }
);

module.exports = CartItem;