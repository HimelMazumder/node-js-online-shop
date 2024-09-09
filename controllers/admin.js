const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/product-form', {
    product: null,
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    isEditing: false
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const product = new Product(null, title, imageUrl, description, price);

  product.save();
  res.redirect('/');
};

exports.getEditProduct = (req, res, next) => {
  const productId = req.params.productId;
  // if edit doesn't exist, isEditing will be undefined
  // edit is string, any string except "" are converted into true, the following code solves the problem
  const isEditing = (req.query.edit === "true");
  console.log(req.query.type);

  if (!isEditing) {
    return res.redirect('/');
  }

  Product.getProductById(productId, product => {
    // if product not found
    /* if (!product) {
      return res.redirect('/');
    } */
    res.render('admin/product-form', {
      product,
      pageTitle: `Edit Product - ${product.title}`,
      path: "/admin/products",
      isEditing
    });
  });
}

exports.postEditProduct = (req, res, next) => {
  const updatedProduct = new Product(
    req.body.productId,
    req.body.title,
    req.body.imageUrl,
    req.body.description,
    req.body.price
  );

  /* updatedProduct.updateProduct(productId, () => {
    console.log("update done"); 
  }); */

  updatedProduct.save();
  res.redirect('/admin/products')
}

exports.getProducts = (req, res, next) => {
  Product.fetchAll(products => {
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products'
    });
  });
};

exports.postDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;
  Product.deleteById(productId, () => {
    res.redirect('/');
  });
};
