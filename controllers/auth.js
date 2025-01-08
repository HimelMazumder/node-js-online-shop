"use strict";

require("dotenv").config();

const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const sendGridTransport = require("nodemailer-sendgrid-transport");
const crypto = require("crypto");

const User = require("../models/user");

const sendGridEmailApiKey = process.env.SENDGRID_EMAIL_API_KEY;

const transporter = nodemailer.createTransport(sendGridTransport({
    auth: {
        api_key: sendGridEmailApiKey
    }
}));

module.exports.getLogin = (req, res, next) => {
    let errMsg = req.flash("logInError");
    errMsg = (errMsg.length > 0) ? errMsg[0] : null

    let msg = req.flash("logInMessage");
    msg = (msg.length > 0) ? msg[0] : null;

    res.render('auth/login', {
        path: "/login",
        pageTitle: "Log In",
        msg,
        errMsg
    });
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;

    User.findOne({ email })
        .then(user => {
            if (!user) {
                req.flash("logInError", "Invalid credentials");
                return res.redirect("/login");
            }

            const password = req.body.password;
            bcrypt.compare(password, user.password)
                .then(isMatched => {
                    if (!isMatched) {
                        req.flash("logInError", "Invalid credentials");
                        return res.redirect("/login");
                    }

                    req.session.userId = user._id;
                    req.session.isLoggedIn = true;

                    req.session.save(err => {
                        if (err) {
                            console.error(err);
                            return;
                        }
                        res.redirect("/");
                    });
                })
                .catch(err => console.error(`❌ - ${err.message}`));
        })
        .catch(err => {
            console.error(`❌ - ${err.message}`);
        });
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        if (err) {
            console.log(err);
        }
        res.redirect("/");
    });
};

exports.getSignup = (req, res, next) => {
    let errMsg = req.flash("signUpError");
    errMsg = (errMsg.length > 0) ? errMsg[0] : null;

    res.render("auth/signup", {
        pageTitle: "Sign Up",
        path: "/signup",
        errMsg,
    });
};

exports.postSignup = (req, res, next) => {
    const email = req.body.email;

    User.findOne({ email })
        .then(user => {
            if (user) {
                req.flash("signUpError", "User already exists");
                return res.redirect("/signup");
            }

            return bcrypt.hash(req.body.password, 12)
                .then(hashedPassword => {
                    const userName = req.body.userName;
                    const newUser = new User({
                        userName,
                        email,
                        password: hashedPassword,
                        cart: { items: [] }
                    });

                    return newUser.save();
                })
                .then(result => {
                    req.flash("logInMessage", "Account created successfully, Try log In now");
                    res.redirect("/login");

                    return transporter.sendMail({
                        to: email,
                        from: "himelmazumder01@gmail.com",
                        subject: "Signup succeeded",
                        html: `<h>You successfully signed up!</h>`
                    })
                })
                .catch(err => console.error(`❌ - ${err.message}`));
        })
        .catch(err => {
            console.error(`❌ - ${err.message}`);
        });
};

exports.getResetPassword = (req, res, next) => {
    let errMsg = req.flash("resetPasswordError");
    errMsg = (errMsg.length > 0) ? errMsg[0] : null;

    res.render("auth/reset-password", {
        path: "/login",
        pageTitle: "Reset Password",
        errMsg
    });
};

exports.postResetPassword = (req, res, next) => {
    const email = req.body.email;
    User.findOne({ email })
        .then(user => {
            if (!user) {
                req.flash("resetPasswordError", "User not found");
                return res.redirect("/reset-password");
            }

            crypto.randomBytes(32, (err, buffer) => {
                if (err) {
                    console.log("err");
                    return res.redirect("/reset-password");
                }

                const token = buffer.toString("hex");

                user.passwordToken = token;
                user.passwordTokenExpiry = Date.now() + 60 * 60 * 1000;

                user.save()
                    .then(result => {
                        req.flash("logInMessage", "An email containing reset password link is sent");
                        res.redirect("/login");
                        transporter.sendMail({
                            to: email,
                            from: "himelmazumder01@gmail.com",
                            subject: "Password reset",
                            html:
                                `<h2>Your password reset link (Expires in 1 hour). </h2>
                            <h3>Click this <a href="http://localhost:3000/new-password/${token}" target="_blank" style="font-size: 1.5rem; font-style: italic">Link</a> to reset your password.</h3>`
                        });
                    })
                    .catch(err => console.log(err.message));
            });
        })
        .catch(err => console.error(`❌ - ${err.message}`));
};

exports.getNewPassword = (req, res, next) => {
    const passwordToken = req.params.passwordToken;
    const query = {
        passwordToken: passwordToken,
        passwordTokenExpiry: { $gt: Date.now() },
    }

    User.findOne(query)
        .then(user => {
            if (!user) {
                req.flash("resetPasswordError", "User not found or Token is expired");
                return res.redirect("/reset-password");
            }

            let errMsg = req.flash("newPasswordError");
            errMsg = (errMsg.length > 0) ? errMsg[0] : null;

            res.render('auth/new-password', {
                path: "/login",
                pageTitle: "New Password",
                errMsg,
                passwordToken,
                userId: user._id
            });
        })
        .catch(err => console.error(`❌ - ${err.message}`));
};

exports.postNewPassword = (req, res, next) => {
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const passwordToken = req.body.passwordToken;
    const userId = req.body.userId;

    if (password !== confirmPassword) {
        req.flash("newPasswordError", "Password did not match");
        return res.redirect(`/new-password/${passwordToken}`);
    }

    User.findById(userId)
        .then(user => {
            if (!user) {
                req.flash("resetPasswordError", "User not found");
                return res.redirect("/reset-password");
            }

            if (user.passwordToken !== passwordToken || user.passwordTokenExpiry <= Date.now()) {
                req.flash("resetPasswordError", "Token not found or Token is expired");
                return res.redirect("/reset-password");
            }

            bcrypt.hash(password, 12)
                .then(hashedPassword => {
                    user.password = hashedPassword;
                    user.passwordToken = undefined;
                    user.passwordTokenExpiry = undefined;

                    return user.save();
                })
                .then(result => {
                    req.flash("logInMessage", "Password updated successfully");
                    res.redirect("/login");
                })
                .catch(err => console.log(err.message));
        })
        .catch(err => console.error(`❌ - ${err.message}`));
};