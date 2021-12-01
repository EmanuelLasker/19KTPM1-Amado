const express = require('express');
const router = express.Router();
const passport = require('passport');
const indexController = require('../controllers/IndexController');

// User
router.get('/login', indexController.getLoginPage);
router.get('/sign-up', indexController.getRegisterPage);
router.post('/sign-up', indexController.postRegisterUser);
router.post(
  '/login',
  passport.authenticate('user-local', {
    successRedirect: '/',
    failureRedirect: '/login',
    successFlash: true,
    failureFlash: true
  })
);
router.get('/cart/delete/:id', indexController.getDeleteProductInCart);
router.post('/cart/update/:id', indexController.postUpdateQTYInCart);
router.get('/cart/:id', indexController.getAddToCartSingle);
router.post('/cart/:id', indexController.postAddToCartMulti);
router.get('/cart', indexController.getCartPage);

router.get('/favorite', indexController.getFavoritePage);
router.get('/favorite/page/:page', indexController.getFavoriteAtPage);
router.get('/product/favorite/delete/:id', indexController.getDeleteFavorite);
router.get('/product/favorite/:id', indexController.getAddFavorite);
router.post('/checkout/bills', indexController.postCheckout)
router.get('/checkout', indexController.getCheckoutPage);
router.get('/search', indexController.search);
router.get('/', indexController.index);

module.exports = router;
