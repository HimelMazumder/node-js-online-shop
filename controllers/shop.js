const Product = require('../models/product');
const Order = require("../models/order");

let count = 1;

exports.getProducts = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products',
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getIndex = (req, res, next) => {

  Product.find()
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
      });
    })
    .catch(err => {
      console.log(err);
    })

};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId; 
  // server sends html document in the response body 
  // browser receives the html document and then sends requests for image asset later
  // value for src attribute in img tage can be of two types - url and path
  // for relative path if base url isn't mentioned in head section, - 
  // - browser takes the current url as base url then appends the path given as src attribute value to base url
  // e.g. current url = https://localhost:3000/products/:productId/ & src = "image_url" then request url for image will be - 
  // - https://localhost:3000/products/:productId/image_url
  // if there's no slash (/) at the end of the base url then browser takes the url upto the last slash (/)
  // e.g. current url = https://localhost:3000/products/:productId then the base url will be current url = https://localhost:3000/products/
  // then request url for image will be - https://localhost:3000/products/image_url
  // this issue may lead to requesting a resource/route exactly same as requesting for a product details with image_url being the product ID
  // *** to resolve this issue check wheter the image url is a valid url or not 
  // *** or in this case check product ID is a valid ObjectID or not
  // *** or make the "products/:productId" a full directory by adding a slash (/) at the end of the route. e.g. "products/:productId/" - 
  // *** then the request url for the image will be "products/:productId/image_url" whill will result in route not found (this has been adopted)
  // *** but there comes no issue for CSS, JS or favicon assets?? the public folder works for them nicely.

  Product.findById(prodId)
    .then(product => {
      
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products',
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
      return req.user.addToCart(product);
    })
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => console.log(err));

};

exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId", "title")
    .then(userReturned => {
      userReturned.cart.items = userReturned.cart.items.filter(item => item.productId !== null);
      userReturned.save();

      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: userReturned.cart.items,
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
        userName: userReturned.userName,
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
  const filter = {
    "user.userId": req.user._id
  }
  Order.find(filter)
    .select("products total")
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders,
      });
    })
    .catch(err => console.log(err));
};
