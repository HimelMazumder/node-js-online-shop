'use strict';

const { Schema, model } = require("mongoose");

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    cart: {
        items: [{
            productId: {
                type: Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            quantity: {
                type: Number,
                default: 1
            }
        }]
    }

});

userSchema.methods.addToCart = function (product) {
    const index = this.cart.items.findIndex(item => item.productId.toString() === product._id.toString());

    if (index >= 0) {
        this.cart.items[index].quantity++;
    } else {
        this.cart.items.push({
            productId: product._id,
        });
    }
    
    return this.save();
};

userSchema.methods.deleteItemFromCart = function (prodId) {
    this.cart.items = this.cart.items.filter(item => item.productId.toString() !== prodId);
     
    return this.save();
};

userSchema.methods.clearCart = function() {
    this.cart = {items: []};
    return this.save();
}

module.exports = model("User", userSchema);

