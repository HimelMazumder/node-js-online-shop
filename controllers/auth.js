"use strict";

const User = require("../models/user");

module.exports.getLogin = (req, res, next) => {
    console.log("session: ");
    console.log(req.session);

    const isAuthenticated = req.session.isLoggedIn;
    console.log("isAuthenticated: " + isAuthenticated);
    console.log();

    res.render('auth/login', {
        path: "/login",
        pageTitle: "Log In",
        isAuthenticated
    });
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    console.log(email, password);

    User.findById("6759bf7fbfc6cfc784c62ebf")
        .then(user => {
            req.session.user = user;
            req.session.isLoggedIn = true;

            req.session.save(err => {
                if (err) {
                    console.error(err);
                    return;
                }

                res.redirect("/");
            });
        })
        .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect("/");
    });
}