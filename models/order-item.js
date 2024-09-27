"use strict";

const { DataTypes } = require('sequelize');

const sequelize = require('../util/database');

const OrderItem = sequelize.define("orderItem",
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
        tableName: "order_seq_item"
    }
);

module.exports = OrderItem;