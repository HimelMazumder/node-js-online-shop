'use strict';

const Product = require('../models/product');

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
  Product.fetchCart(products => {
    let total = 0;
    products.forEach(product => {
      total += Number(product.price);
      product.priceTotal = product.price * product.quantity;
      product.priceTotal = product.priceTotal.toFixed(2);
    });

    res.render('shop/cart', {
      prods: products,
      total,
      path: '/cart',
      pageTitle: 'Your Cart',
    });
  })
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

exports.postAddToCart = (req, res, next) => {
  const id = req.params.productId;
  Product.updateCart(id, () => {
    res.redirect('/cart');
  });

}
