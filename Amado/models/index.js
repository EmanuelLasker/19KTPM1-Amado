const mongoose = require('mongoose');

// Mongoose connect
mongoose
  .connect("mongodb://127.0.0.1/ecommerce", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database Connected!");
  })
  .catch((err) => {
    console.log(err);
  });
mongoose.connection.on("error", (err) => {
  console.log(err);
});
// End mongoose connect

module.exports = mongoose;