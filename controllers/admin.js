'use strict';

const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
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
      console.log("product created");
      res.redirect('/admin/products');
    })
    .catch(err => {
      console.log(err);
    })

};

exports.getProducts = (req, res, next) => {

  Product.find({ userId: req.user._id })
    .then(products => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
      });
    })
    .catch(err => console.log(err));

};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }

  const prodId = req.params.productId;
  const userId = req.user._id;

  const query = {
    _id: prodId,
    userId
  };

  Product.findOne(query)
    .then(product => {
      if (!product) {
        console.log("product not found");
        return res.redirect('/');
      }

      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
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

      if (product?.userId.toString() === req.user._id.toString()) {
        product.title = updatedTitle;
        product.price = updatedPrice;
        product.description = updatedDesc;
        product.imageUrl = updatedImageUrl;

        product.save()
          .then(result => {
            console.log('UPDATED PRODUCT!');
            res.redirect('/admin/products');
          });

      } else {
        console.log("product not found");
        res.redirect("/");
      }
    })
    .catch(err => console.log(err));
};


exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const userId = req.user._id;

  const query = {
    _id: prodId,
    userId
  };

  Product.findOneAndDelete(query)
    .then(result => {

      if (!result) {
        console.log("product not found");
        return res.redirect("/");
      }

      res.redirect('/admin/products');
    })
    .catch(err => console.log(err));

}; 
