module.exports.isLoggedIn = (req, res, next) => {
    console.log("req.user", req.user);
    if(!req.isAuthenticated()){
        req.flash('error', 'ログインしてください');
        return res.redirect('/login');
    }
    next();
}