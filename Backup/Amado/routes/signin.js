var express = require('express');
var router = express.Router();
const passport = require("passport");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('signin', { title: 'Express' });
});

module.exports = router;