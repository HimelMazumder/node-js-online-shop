"use strict";

// all imports  ----------------->
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const session = require("express-session");
const MongodbSessionStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");

const errorController = require('./controllers/error');
const User = require("./models/user");

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require("./routes/auth");

// all initialization - executed once when server starts  ----------------->
const app = express();
const MONGODB_URI = "mongodb+srv://himelMazumder:v43Sp6Y4qJWswrFT@primarycluster.tduuh.mongodb.net/node_test_live?retryWrites=true&w=majority&appName=Cluster0";
const mongodbSessionStore = new MongodbSessionStore({
  uri: "mongodb+srv://himelMazumder:v43Sp6Y4qJWswrFT@primarycluster.tduuh.mongodb.net/node_test_live",
  collection: "sessions",
});
const csrfProtection = csrf();
const PORT = process.env.PORT || 3030;

app.set('view engine', 'ejs');
app.set('views', 'views');

// all routes with middlewares - executed for each request  ----------------->
// configuration related - for all requests
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: "'20pZ3?s}YZi_}iddUQ,C05P1",
  resave: false,
  saveUninitialized: false,
  store: mongodbSessionStore,
  cookie: {
    httpOnly: true,
  }
}));

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  const userId = req.session.userId;

  if (userId) {
    return User.findById(userId)
      .then(user => {
        if (!user) {
          return req.session.destroy(err => {
            if (err) {
              throw new Error(err.message);
            }
            res.redirect("/login");
          });
        }

        req.user = user;
        next();
      })
      .catch(err => console.error(`❌ - ${err.message}`));
  }

  next();
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  res.locals.userName = req.user?.userName;
  next();
});

// route specific - only for requests with specific route
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

// page/resource not found related error
app.use(errorController.get404);

// starting the server ----------------->
mongoose.connect(MONGODB_URI)
  .then(result => {
    console.log("DB Connected");

    const host = "localhost";
    app.listen(PORT, () => {
      console.log(`Server started at port ${PORT}`);
    });
  })
  .catch(err => console.log(err));
