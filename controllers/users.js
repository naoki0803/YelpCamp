const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}

module.exports.register = async (req, res) => {
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
}

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash('success', 'ログアウトしました');
        res.redirect('/campgrounds');
    });
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
}

module.exports.login = (req, res) => {
    req.flash('success', 'おかえりなさい');
    // console.log("req.session.returnToの中身 or演算子の前", req.session);
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    // res.send(req.session);
    res.redirect(redirectUrl);
}

// module.exports.logout = (req, res) => {
//     req.logout();
//     req.flash('success', 'ログアウトしました');
//     res.redirect('/campgrounds');
// }