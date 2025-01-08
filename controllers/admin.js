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
  // authentication ->> registration | outsider vs insider
  // authorization ->> permission | permitted vs not permitted
  // only products created by the user, will be shown to the user for edit or delete
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

  // attacker can insert another product id in the admin/products page's edit link using browser's developer tools, 
  // then can edit other user's product
  // to stop that we need to know if the current user is also the owner the product
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

  /* Product.findById(prodId)
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }

      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
      });
    })
    .catch(err => console.log(err)); */

};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;

  Product.findById(prodId)
    .then(product => {
      // attacker can insert another product id in the admin/edit-product page's edit product form using browser's developer tools, 
      // then can edit other user's product
      // to stop that we need to know if the current user is also the owner the product
      // *** product.userId === req.user._id won't work as we are also checking type equality using '===/!=='. convert both into string using toString()
      /* if (product && product.userId === req.user._id) { */
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

  // attacker can insert another product id in the admin/products page's delete form using browser's developer tools, 
  // then can delete other user's product
  // to stop that we need to know if the current user is also the owner the product
  const query = {
    _id: prodId,
    userId
  };

  // Product.deleteOne(query).then().catch(); - would also work but it won't return the deleted document. so, we couldn't show the "product not found" message in console.
  // it returns a result object containing metadata about the deletion (e.g., { acknowledged: true, deletedCount: 1 }).

  Product.findOneAndDelete(query)
    .then(result => {
      // findOneAndDelete() function finds a matching document, removes it, and returns the document that was deleted (or null if no document was found)
      if (!result) {
        console.log("product not found");
        return res.redirect("/");
      }

      res.redirect('/admin/products');
    })
    .catch(err => console.log(err));

  /* Product.findByIdAndDelete(prodId)
    .then(result => {
      res.redirect('/admin/products');
    })
    .catch(err => console.log(err)); */
}; 
