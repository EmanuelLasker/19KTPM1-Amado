const adminModel = require('../models/admin');
const passport = require("passport");
const bcrypt = require('bcrypt');
const LocalStrategy = require("passport-local").Strategy;

passport.use(
    'admin-local',
    new LocalStrategy(function (username, password, done) {
        adminModel.findOne(
            { 'loginInformation.userName': username },
            function (err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false, { message: 'Sai tên tài khoản hoặc mật khẩu!' });
                }
                 // !HASH_HERE
                if (!bcrypt.compareSync(password, user.loginInformation.password)) {
                    return done(null, false, { message: 'Sai tên tài khoản hoặc mật khẩu!' });
                }
                return done(null, user, { message: 'Đăng nhập thành công!' });
            }
        );
    })
);

passport.serializeUser((user, done) => {
    return done(null, { username: user.loginInformation.userName, type: user.loginInformation.type });
});

passport.deserializeUser((user, done) => {
    adminModel.findOne({ 'loginInformation.userName': user.username }, (err, result) => {
        if (err) return done(err);
        if (!result) return done(null, false);
        if (result.loginInformation.userName == user.username) {
            return done(null, result);
        }
    });
});

module.exports = passport;