'use strict';

const fs = require('fs');
const path = require('path');
const rootDir = require('../util/path');

const p = path.join(rootDir, 'data', 'cart.json');

module.exports = class Cart {
    static addProduct(id, productPrice) {
        fs.readFile(p, (err, fileContent) => {
            let cart = {
                products: [],
                totalPrice: 0
            };

            if (!err) {
                cart = JSON.parse(fileContent);
            }

            const existingProductIndex = cart.products.findIndex(product => product.id === id);
            let updatedProduct;
            if (existingProductIndex !== -1) {
                const existingProduct = cart.products[existingProductIndex];

                // clumsy
                updatedProduct = { ...existingProduct };
                updatedProduct.quantity++;
                cart.products[existingProductIndex] = updatedProduct;

                // better
                /* existingProduct.quantity++; */
            } else {
                updatedProduct = {
                    id,
                    quantity: 1
                };

                // clumsy
                cart.products = [...cart.products, updatedProduct];

                // better
                /* cart.products.push(updatedProduct); */
            }

            /* cart.totalPrice += Number(productPrice); */
            // +productPrice here + converts string to number
            cart.totalPrice = cart.totalPrice + +productPrice;

            fs.writeFile(p, JSON.stringify(cart), err => {
                console.log(err);
            });

        })
    }

    static deleteProduct(productId, productPrice, cb) {
        fs.readFile(p, (err, fileContent) => {
            if (err) {
                return;
            }
            const cart = JSON.parse(fileContent); 
            const existingProductCart = cart.products.find(product => product.id === productId);
            if (existingProductCart !== undefined) {
                cart.totalPrice -= (existingProductCart.quantity * productPrice);
                cart.products = cart.products.filter(product => product.id !== productId);
                fs.writeFile(p, JSON.stringify(cart), err => {
                    if (err) {
                        console.log(err);
                    } else {
                        cb();
                    }
                });
            } else {
                // if we don't use else block here and delete a product that isn't in cart, 
                // then existingProduct in modle -> product.js -> deleteById magically becomes undefined and products array in the same file becomes empty '[]'
                // will have to investigate
                cb();
            }
        });
    }

    static getCart(cb) {
        fs.readFile(p, (err, fileContent) => {
            if (err) {
                cb(null);
            } else {
                const cart = JSON.parse(fileContent);
                cb(cart);
            }
        });
    }
}