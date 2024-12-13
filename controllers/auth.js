"use strict";

const bcrypt = require("bcryptjs");

const User = require("../models/user");

module.exports.getLogin = (req, res, next) => {
    /* const isAuthenticated = req.session.isLoggedIn; */

    let errorMsg = req.flash("error");
    if (errorMsg.length > 0) {
        errorMsg = errorMsg[0];
    } else {
        errorMsg = null;
    }
    
    res.render('auth/login', {
        path: "/login",
        pageTitle: "Log In",
        /* isAuthenticated, */
        /* isAuthenticated: false,
        csrfToken: req.csrfToken(), */
        // req.flash("error") returns an array with flash messages
        errorMsg
    });
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    User
        .findOne({
            email
        })
        .then(user => {
            if (!user) {
                req.flash("error", "Invalid email");
                return res.redirect("/login");
            }

            bcrypt
                .compare(password, user.password)
                .then(isMatched => {
                    if (isMatched) {
                        req.session.user = user;
                        req.session.isLoggedIn = true;

                        return req.session.save(err => {
                            if (err) {
                                console.error(err);
                                return;
                            }

                            res.redirect("/");
                        });
                    }

                    req.flash("error", "Invalid password");
                    res.redirect("/login");
                })
                .catch(err => console.log(err.message));
        })
        .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect("/");
    });
};

exports.getSignup = (req, res, next) => {
    /* const isAuthenticated = req.session.isLoggedIn; */
    let errorMsg = req.flash("error");
    if (errorMsg.length > 0) {
        errorMsg = errorMsg[0];
    } else {
        errorMsg = null;
    }

    res.render("auth/signup", {
        pageTitle: "Sign Up",
        path: "/signup",
        /* isAuthenticated, */
        /* isAuthenticated: false, */
        errorMsg
    });
};

exports.postSignup = (req, res, next) => {
    const userName = req.body.userName;
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const cart = { items: [] };

    if (password !== confirmPassword) {
        req.flash("error", "Password did not match");
        return res.redirect("/signup");
    }

    const filter = { email };
    User.findOne(filter)
        .then(user => {
            if (user) {
                req.flash("error", "Email already exists");
                // this return won't stop the execution of the next then block
                // only - return bcrypt.hash(password, 12); - won't get executed
                // the return result will be the result of the next then block
                return res.redirect("/signup");
            }

            // encrypting password
            return bcrypt.hash(password, 12)
                .then(hashedPassword => {
                    const newUser = new User({
                        name: userName,
                        email: email,
                        password: hashedPassword,
                        cart: cart
                    });

                    return newUser.save();
                })
                .then(result => {
                    res.redirect("/login");
                });
        })
        .catch(err => console.log("error: " + err.message));
};