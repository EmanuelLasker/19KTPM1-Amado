const express = require("express");
const app = express();
const path = require("path");
const index = require('./routes/index.router');
const product = require("./routes/product.route");
const categories = require("./routes/categories.route");
const PORT = 3000;
const flash = require('connect-flash');
const mongoose = require("mongoose");
// Passport Config
const customer = require('./models/customers');
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

app.use(
  session({
    secret: "thesecret",
    saveUninitialized: true,
    resave: false,
    cookie: { maxAge: Infinity, path: '/' }
  })
);
app.use(
  session({
    secret: "secret",
    saveUninitialized: true,
    resave: false,
  })
);
app.use(flash());

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
          return done(null, false, { message: 'Sai tên tài khoản hoặc mật khẩu!' });
        }
        if (user.loginInformation.password !== password) {
          return done(null, false, { message: 'Sai tên tài khoản hoặc mật khẩu!' });
        }
        return done(null, user, { message: 'Đăng nhập thành công!' });
      }
    );
  })
);


app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser((user, done) => {
  return done(null, { username: user.loginInformation.userName, type: user.loginInformation.type });
});
passport.deserializeUser((user, done) => {
  customer.findOne({ 'loginInformation.userName': user.username }, (err, result) => {
    if (err) return done(err);
    if (!result) return done(null, false);
    if (result.loginInformation.userName == user.username) {
      return done(null, result);
    }
  });

});
// Mongoose connect
mongoose
  .connect('mongodb://127.0.0.1/ecommerce', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connected!");
  })
  .catch((err) => {
    console.log(err);
  });
mongoose.set("useFindAndModify", false);
mongoose.connection.on("error", (err) => {
  console.log(err);
});
// End mongoose connect

app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ extended: true, limit: "30mb" }));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "/")));

// Router
app.use("/", index);
app.use("/product", product);
app.use("/categories", categories);

app.listen(PORT, () => {
  console.log(`Server is started at: localhost:${PORT}`);
});
