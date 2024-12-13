'use strict';

const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  /* if (!req.session.isLoggedIn) {
    return res.redirect("/login");
  } */

  /* const isAuthenticated = req.session.isLoggedIn;
  console.log(isAuthenticated); */

  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    /* isAuthenticated, */
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;

  const product = new Product({
    title,
    price,
    description,
    imageUrl,
    userId: req.user._id,
  });

  product.save()
    .then(result => {
      console.log("product created", result);
      res.redirect('/admin/products');
    })
    .catch(err => {
      console.log(err);
    })

};

exports.getProducts = (req, res, next) => {
  /* if (!req.session.isLoggedIn) {
    return res.redirect("/login");
  } */

  const filter = { userId: req.user._id }

  Product.find(filter)
    .then(products => {

      /* const isAuthenticated = req.session.isLoggedIn;
      console.log(isAuthenticated); */

      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
        /* isAuthenticated */
      });
    })
    .catch(err => console.log(err));

};

exports.getEditProduct = (req, res, next) => {
  /* if (!req.session.isLoggedIn) {
    return res.redirect("/login");
  } */

  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }

      /* const isAuthenticated = req.session.isLoggedIn;
      console.log(isAuthenticated); */

      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
        /* isAuthenticated */
      });
    })
    .catch(err => console.log(err));

};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;

  Product.findById(prodId)
    .then(product => {
      if (product) {
        product.title = updatedTitle;
        product.price = updatedPrice;
        product.description = updatedDesc;
        product.imageUrl = updatedImageUrl;
        return product.save();

      } else {
        console.log("Product not found");
      }
    })
    .then(result => {
      console.log('UPDATED PRODUCT!');
      res.redirect('/admin/products');
    })
    .catch(err => console.log(err));
};


exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;

  const query = {
    _id: prodId
  };

  Product.findByIdAndDelete(prodId)
    .then(result => {
      res.redirect('/admin/products');
    })
    .catch(err => console.log(err));
}; 
