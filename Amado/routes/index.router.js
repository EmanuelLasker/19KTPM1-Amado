const express = require('express');
const router = express.Router();
const passport = require('passport');
const indexController = require('../controllers/IndexController');

// User
router.get('/signin', indexController.getSigninPage);
router.get('/signup', indexController.getRegisterPage);
router.post('/signup', indexController.postRegisterUser);
router.post(
  '/signin',
  passport.authenticate('user-local', {
    successRedirect: '/',
    failureRedirect: '/signin',
    successFlash: true,
    failureFlash: true
  })
);

router.get('/shop', indexController.getShopPage);
router.get('/productdetails', indexController.getProductDetailsPage);

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

// Logout
router.get('/logout', indexController.getLogout);

module.exports = router;
