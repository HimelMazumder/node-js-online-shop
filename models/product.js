'use strict';

const fs = require('fs');
const path = require('path');

const p = path.join(
  path.dirname(require.main.filename),
  'data',
  'products.json'
);

const c = path.join(
  path.dirname(require.main.filename),
  'data',
  'cart.json'
)

const getProductsFromFile = cb => {
  fs.readFile(p, (err, fileContent) => {
    if (err) {
      cb([]);
    } else {
      cb(JSON.parse(fileContent));
    }
  });
};

const getProductsFromCart = cb => {
  fs.readFile(c, (err, fileContent) => {
    if (err) {
      cb([]);
    } else {
      cb(JSON.parse(fileContent));
    }
  });
}

module.exports = class Product {
  constructor(title, imageUrl, description, price) {
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save() {
    getProductsFromFile(products => {
      products.push(this);

      let id;

      while (true) {
        id = Math.trunc(Math.random() * (products.length * 5) + 1);

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

      fs.writeFile(p, JSON.stringify(products), err => {
        console.log(err);
      });
    });
  }

  static updateCart(id, cb) {
    getProductsFromCart(cartProducts => {
      const product = cartProducts.find(cartProduct => cartProduct.id === id);
      if (product !== undefined) {
        product.quantity++;
        fs.writeFile(c, JSON.stringify(cartProducts), err => {
          console.log(err);
        });
      } else {
        Product.getProductById(id, product => {
          product.quantity = 1;
          cartProducts.push(product);
          fs.writeFile(c, JSON.stringify(cartProducts), err => {
            console.log(err);
          });
        });
      }
    });

    cb();
  }

  static fetchAll(cb) {
    getProductsFromFile(cb);
  }

  static fetchCart(cb) {
    getProductsFromCart(cb);
  }

  static getProductById(id, cb) {
    getProductsFromFile(products => {
      const product = products.find(p => p.id === id);
      product.id = id;
      cb(product);
    })
  }
};
