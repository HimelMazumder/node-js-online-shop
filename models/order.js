'use strict';

const {Schema, model} = require("mongoose");

const orderSchema = new Schema({
    products: [{
        productData: {
            type: Object,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        }
    }],
    user: {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        name: {
            type: String,
            required: true
        }
    },
    total: {
        type: Number,
        required: true
    }
});

module.exports = model("Order", orderSchema);