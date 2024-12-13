const Product = require('../models/product');
const User = require('../models/user');
const Order = require("../models/order");

exports.getProducts = (req, res, next) => {
  Product.find()
    .then(products => {
      /* const isAuthenticated = req.session.isLoggedIn; */

      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products',
        /* isAuthenticated */
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getIndex = (req, res, next) => {

  Product.find()
    .then(products => {
      /* const isAuthenticated = req.session.isLoggedIn; */

      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
        /* isAuthenticated,
        csrfToken: req.csrfToken() */
      });
    })
    .catch(err => {
      console.log(err);
    })

};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      /* const isAuthenticated = req.session.isLoggedIn;
      console.log(isAuthenticated); */

      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products',
        /* isAuthenticated */
      });
    })
    .catch(err => console.log(err));
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      if (!product) {
        throw new Error("product not found in DB!");
      }
      console.log(req.user);
      return req.user.addToCart(product);
    })
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => console.log(err));

};

exports.getCart = (req, res, next) => {
  /* if (!req.session.isLoggedIn) {
    return res.redirect("/login");
  } */

  req.user
    .populate("cart.items.productId", "title")
    .then(userReturned => {
      userReturned.cart.items = userReturned.cart.items.filter(item => item.productId !== null);
      userReturned.save();

      /* const isAuthenticated = req.session.isLoggedIn; */

      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: userReturned.cart.items,
        /* isAuthenticated */
      });
    })
    .catch(err => console.log(err));
};


exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user.deleteItemFromCart(prodId)
    .then(result => {
      res.redirect("/cart");
    })
    .catch(err => console.log(err));
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then(userReturned => {
      let total = 0;
      const products = userReturned.cart.items.map(item => {
        total += item.productId.price * item.quantity;
        return {
          productData: { ...item.productId._doc },
          quantity: item.quantity
        }
      });

      const user = {
        userId: userReturned,
        name: userReturned.name,
        email: userReturned.email
      };

      const newOrder = new Order({
        products,
        user,
        total
      });

      return newOrder.save();
    })
    .then(result => {
      return req.user.clearCart();
    })
    .then(result => {
      res.redirect('/orders');
    })
    .catch(err => console.log(err));
};

exports.getOrders = (req, res, next) => {
  /* if (!req.session.isLoggedIn) {
    return res.redirect("/login");
  } */
  
  const filter = {
    "user.userId": req.user._id
  }
  Order.find(filter)
    .select("products total")
    .then(orders => {
      /* const isAuthenticated = req.session.isLoggedIn; */

      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders,
        /* isAuthenticated */
      });
    })
    .catch(err => console.log(err));
};
