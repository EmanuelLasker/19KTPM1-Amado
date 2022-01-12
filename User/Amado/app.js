const express = require("express");
const app = express();
const path = require("path");
const index = require('./components/users/user.router');
const product = require("./components/products/product.route");
const categories = require("./components/categories/categories.route");
const flash = require('connect-flash');
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("./passport/passport");
const dotenv = require('dotenv');
dotenv.config();
const PORT = process.env.PORT;

// Passport configuration
app.use(
  session({
    secret: "thesecret",
    saveUninitialized: true,
    resave: false,
    cookie: { maxAge: Infinity, path: '/' }
  })
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Mongoose connection
mongoose
  .connect(process.env.DB_HOST, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database has been connected!");
  })
  .catch((err) => {
    console.log(err);
  });
mongoose.set("useFindAndModify", false);
mongoose.connection.on("error", (err) => {
  console.log(err);
});

app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ extended: true, limit: "30mb" }));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "/")));

// Router
app.use("/", index);
app.use("/product", product);
app.use("/categories", categories);

app.listen(PORT, () => {
  console.log(`Server started at: localhost:${PORT}`);
});


// const express = require('express')
// const ExpressRedisCache = require('express-redis-cache')
//
// const app = express()
// const port = 3000
//
// const cache = ExpressRedisCache({
//     expire: 10, // optional: expire every 10 seconds
// })
//
// const wait = ms => new Promise(resolve => setTimeout(resolve, ms))
//
// function greet(req, res) {
//     const between1and3seconds =
//         1000 + Math.floor(Math.random() * Math.floor(2000))
//     wait(between1and3seconds).then(() =>
//         res.send(`Hello, I just waited ${between1and3seconds} ms`),
//     )
// }
//
// // app.get('/', greet)
// app.get('/cached', cache.route(), greet)
//
// app.listen(port, () => {
//     console.log(`Example app listening on port ${port}!`);
//     //cache.set("a","hihi");
// })
