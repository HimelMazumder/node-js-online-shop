"use strict";

const { DataTypes } = require('sequelize');

const sequelize = require('../util/database');

const Order = sequelize.define("order", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
}, {
    tableName: "order_seq"
});

module.exports = Order;