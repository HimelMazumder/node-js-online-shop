'use strict';

const fs = require('fs');
const path = require('path');

const Cart = require('./cart');

const p = path.join(
  path.dirname(require.main.filename),
  'data',
  'products.json'
);

const getProductsFromFile = cb => {
  fs.readFile(p, (err, fileContent) => {
    if (err) {
      cb([]);
    } else {
      cb(JSON.parse(fileContent));
    }
  });
};

module.exports = class Product {
  constructor(id, title, imageUrl, description, price) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  // upset function -> if not exists : add new || if exists : update
  save() {
    getProductsFromFile(products => {
      // value of parameter should not be changed!!
      const updatedProducts = [...products];
      if (!this.id) {
        // new product logic
        updatedProducts.push(this);

        let id;

        while (true) {
          id = Math.trunc(Math.random() * (products.length + 10));
          let idIsUnique = true;
          for (const product of products) {
            if (product.id === `00${id}`) {
              idIsUnique = false;
              break;
            }
          }

          if (idIsUnique) {
            break;
          }
        }

        this.id = `00${id}`;

      } else {
        // update product logic
        const existingProductIndex = products.findIndex(product => this.id === product.id);
        /* products[existingProductIndex] = this; */
        updatedProducts[existingProductIndex] = this;
      }

      fs.writeFile(p, JSON.stringify(updatedProducts), err => {
        if (err) {          
        console.log(err);
        }
      });

    });
  }

  updateProduct(id, cb) {
    getProductsFromFile(products => {
      const productIndex = products.findIndex(product => product.id === id);
      products[productIndex] = this;
      console.log(products);
      fs.writeFile(p, JSON.stringify(products), err => {
        if (!err) {
          cb();
        }
      });
    });
  }

  static deleteById(productId, cb) {
    getProductsFromFile(products => {
      // without else block in model -> cart.js -> deleteProduct products is [] and existing product is undefined
      const existingProduct = products.find(product => product.id === productId);
      const updatedProducts = products.filter(product => product.id !== productId);

      fs.writeFile(p, JSON.stringify(updatedProducts), err => {
        if (!err) {
          Cart.deleteProduct(productId, existingProduct.price, cb);
        }
      });
    });
  }

  static fetchAll(cb) {
    getProductsFromFile(cb);
  }

  static getProductById(id, cb) {
    getProductsFromFile(products => {
      const product = products.find(p => p.id === id);
      cb(product);
    })
  }
};
