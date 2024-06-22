const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');

router.get('/register', (req, res) => {
    res.render('users/register');
});

router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ username, email });
        const regusteredUser = await User.register(user, password);
        req.login(regusteredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Yelp Campへようこそ');
            res.redirect('/campgrounds');
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
});

router.get('/login', (req, res) => {
    res.render('users/login');
});

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'おかえりなさい');
    res.redirect('/campgrounds');
});

// router.get('/logout', (req, res) => {
//     req.logout();
//     req.flash('success', 'ログアウトしました');
//     res.redirect('/campgrounds');
// });

router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash('success', 'ログアウトしました');
        res.redirect('/campgrounds');
    });
});


module.exports = router;