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

const PORT = process.env.PORT || 3030;

const app = express();
const MONGODB_URI = "mongodb+srv://himelMazumder:v43Sp6Y4qJWswrFT@cluster0.tduuh.mongodb.net/node_test_mon_live?retryWrites=true&w=majority&appName=Cluster0";
const mongodbSessionStore = new MongodbSessionStore({
  uri: "mongodb+srv://himelMazumder:v43Sp6Y4qJWswrFT@cluster0.tduuh.mongodb.net/node_test_mon_live",
  collection: "sessions",
});
const csrfProtector = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require("./routes/auth");

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

// to avoid cross site requesting forgery attacks
app.use(csrfProtector);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  // token should only be in middlewares that are rendering pages with forms
  // but we used it for all rendered pages
  res.locals.csrfToken = req.csrfToken();
  // name will be there for all rendered pages when user is logged in
  res.locals.name = req.session.user?.name;
  next();
});

app.use((req, res, next) => {
  if (req.session.user) {
    return User.findById(req.session.user._id)
      .then(user => {
        req.user = user;
        next();
      })
      .catch(err => console.log(err));
  } 
  next();
});


app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose.connect(MONGODB_URI)
  .then(result => {
    console.log("DB Connected");
    app.listen(PORT, () => {
      console.log(`Server running on ${host} at port ${PORT}`);
    });
  })
  .catch(err => console.log(err));
