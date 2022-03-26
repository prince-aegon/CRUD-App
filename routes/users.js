const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const passport = require('passport');

// Bring in models/schema
const User = require('../models/user');
// const { render } = require('express/lib/response');

// Register form
router.get('/register', (req, res) => {
    res.render('register', { errors: null });
});

// Register process

router.post('/register',
    body('name').isLength({ min: 1 }).withMessage('Name Required'),
    body('email').isLength({ min: 1 }).withMessage('email Required'),
    body('email').isEmail().withMessage('email not valid'),
    body('username').isLength({ min: 1 }).withMessage('Username Required'),
    body('password').isLength({ min: 1 }).withMessage('Password Required'),
    body('confirm').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Password confirmation does not match password');
        }

        // Indicates the success of this synchronous custom validator
        return true;
    }),
    (req, res) => {

        let user = new User({
            name: req.body.name,
            email: req.body.email,
            username: req.body.username,
            password: req.body.password
        });

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors);
            res.render('register', {
                errors
            });
        }
        else {
            let newuser = new User();
            newuser.name = req.body.name,
                newuser.email = req.body.email,
                newuser.username = req.body.username,
                newuser.password = req.body.password

            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newuser.password, salt, (err, hash) => {
                    if (err) {
                        console.log(err);
                    }
                    newuser.password = hash;
                    console.log(hash);

                });
            })
            newuser.save((err) => {
                if (err) {
                    console.log(err);
                }
                else {
                    req.flash('success', 'Registered!! Please Log in');
                    res.redirect('/users/login');
                }
            });
        }
    })


router.get('/login', (req, res) => {
    res.render('login');
})

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});


router.get('/logout', function (req, res) {
    req.logout();
    req.flash('success', 'You are logged out');
    res.redirect('/users/login');
});



module.exports = router;