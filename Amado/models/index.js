const mongoose = require('mongoose');

// Mongoose connect
mongoose
  .connect(process.env.MONGODB_URI, {
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