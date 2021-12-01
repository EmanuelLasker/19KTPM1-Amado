var createError = require('http-errors');
const express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var port = 3000;

var indexRouter = require('./routes/index.router');
//var usersRouter = require('./routes/users');
var cartRouter = require('./routes/cart');
var checkoutRouter = require('./routes/checkout');
var productdetailsRouter = require('./routes/product-details');
var shopRouter = require('./routes/shop');
var signinRouter = require('./routes/signin');
var signupRouter = require('./routes/signup');
const flash = require('connect-flash');
// Passport Config
const adminModel = require('./models/admin');
const customer = require('./models/customers');
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const app = express();


app.use(
  session({
    secret: "thesecret",
    saveUninitialized: true,
    resave: false,
    cookie: {maxAge: Infinity, path: '/'}
  })
);
app.use(
  session({
    secret: "secret",
    saveUninitialized: true,
    resave: false,
    cookie: {maxAge: Infinity, path: '/admin'}
  })
);
app.use(flash());
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
          return done(null, false, {message: 'Sai tên tài khoản hoặc mật khẩu!'});
        }
        if (user.loginInformation.password !== password) {
          return done(null, false, {message: 'Sai tên tài khoản hoặc mật khẩu!'});
        } 
        return done(null, user, {message: 'Đăng nhập thành công!'});
      }
    );
  })
);
passport.use(
  'user-local',
  new LocalStrategy(function (username, password, done) {
    customer.findOne(
      { 'loginInformation.userName': username },
      function (err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, {message: 'Sai tên tài khoản hoặc mật khẩu!'});
        }
        if (user.loginInformation.password !== password) {
          return done(null, false, {message: 'Sai tên tài khoản hoặc mật khẩu!'});
        } 
        return done(null, user, {message: 'Đăng nhập thành công!'});
      }
    );
  })
);
app.use(function(req, res, next){
  // all the stuff from the example
  if (req.session.user) {
    res.locals.user = req.session.user
  }
  next();
});

app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser((user, done) => {
    return done(null, {username: user.loginInformation.userName, type: user.loginInformation.type});
});
passport.deserializeUser((user, done) => {
  if(user.type == 'Admin') {
    adminModel.findOne({ 'loginInformation.userName': user.username }, (err, result) => {
      if (err) return done(err);
      if (!result) return done(null, false);
      if (result.loginInformation.userName == user.username) {
        return done(null, result);
      }
    });
  } else {
    customer.findOne({ 'loginInformation.userName': user.username }, (err, result) => {
      if (err) return done(err);
      if (!result) return done(null, false);
      if (result.loginInformation.userName == user.username) {
        return done(null, result);
      }
    });
  }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', indexRouter);
app.use('/index', indexRouter);
//app.use('/users', usersRouter);
app.use('/cart', cartRouter);
app.use('/checkout', checkoutRouter);
app.use('/productdetails', productdetailsRouter);
app.use('/shop', shopRouter);
app.use('/signin', signinRouter);
app.use('/signup', signupRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;