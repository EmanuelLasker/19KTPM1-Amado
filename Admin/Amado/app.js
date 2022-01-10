const express = require("express");
const app = express();
const path = require("path");
const admin = require("./components/admin/admin.route");
const PORT = 3001;
const flash = require('connect-flash');
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("./passport/passport");

app.use(
  session({
    secret: "secret",
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
  .connect('mongodb://127.0.0.1/ecommerce', {
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
app.use("/", admin);
app.use('/admin', admin);

app.listen(PORT, () => {
  console.log(`Server started at: localhost:${PORT}`);
});