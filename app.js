const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");

const errorController = require('./controllers/error');
const User = require("./models/user");

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findById("673ff13f6c2953e988f22890")
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose.connect("mongodb+srv://himelMazumder:v43Sp6Y4qJWswrFT@cluster0.tduuh.mongodb.net/node_test_mon?retryWrites=true&w=majority&appName=Cluster0")
  .then(result => {
    
    return User.findById("673ff13f6c2953e988f22890");
  })
  .then(user => {
    if (!user) {
      const user = new User({
        name: "Kratu",
        email: "kratu@krishnadas.com",
        cart: {
          items: []
        }
      });

      user.save()
    }

    console.log("DB Connected");
    app.listen(3000); 
  })
  .catch(err => console.log(err));
