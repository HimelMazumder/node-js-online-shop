'use strict';

const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getProducts = (req, res, next) => {
  Product.fetchAll(products => {
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products'
    });
  });
};

exports.getIndex = (req, res, next) => {
  Product.fetchAll(products => {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/'
    });
  });
};

exports.getCart = (req, res, next) => {
  
  Cart.getCart(cart => {
    
      Product.fetchAll(products => {
        const cartProducts = [];
        let totalPrice = 0;
        if (cart !== null) {
          for (const product of products) {
            const cartProduct = cart.products.find(cartProduct => cartProduct.id === product.id);
            if (cartProduct) {
              cartProducts.push({
                productData: product,
                quantity: cartProduct.quantity
              });
            }
          }        
          totalPrice = cart.totalPrice;
        }        

        /* cartProducts.forEach(cartProduct => {
          console.table(cartProduct.productData);
        }); */

        res.render('shop/cart', {
          prods: cartProducts,
          totalPrice,
          path: '/cart',
          pageTitle: 'Your Cart'
        });
  
      });
    
  });

  /* Product.fetchAll(products => {
    Cart.getCart(cart => {
      const cartProducts = [];
      for (const cartProduct of cart.products) {
        const product = products.find(prod => cartProduct.id === prod.id);
        if (product) {
          product.quantity = cartProduct.quantity;
          cartProducts.push(product);
        }
      }

      const totalPrice = cart.totalPrice;
      res.render('shop/cart', {
        prods: cartProducts,
        totalPrice,
        path: '/cart',
        pageTitle: 'Your Cart'
      });

    });
  }); */

};

exports.getOrders = (req, res, next) => {
  res.render('shop/orders', {
    path: '/orders',
    pageTitle: 'Your Orders'
  });
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};

exports.getProductDetail = (req, res, next) => {
  const productId = req.params.productId;
  Product.getProductById(productId, product => {
    res.render('shop/product-detail', {
      product,
      pageTitle: `${product.title} Details`,
      path: '/products'
    });
  });

};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;

  // clumsy
  Product.getProductById(prodId, product => {
    Cart.addProduct(prodId, product.price);
  })

  // better
  /* const prodPrice = req.body.productPrice;
  Cart.addProduct(prodId, prodPrice); */

  res.redirect('/cart');
};

exports.postDeleteCartItem = (req, res, next) => {
  const productId = req.body.productId;
  console.log(`product id: ${productId}`);
  Product.getProductById(productId, product => {
    Cart.deleteProduct(productId, product.price, () => {
      res.redirect('/cart');
    });
  });
};


