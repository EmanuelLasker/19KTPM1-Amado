const express = require('express');
const router = express.Router();
const passport = require('passport');
const userController = require('../users/UserController');

router.get('/login', userController.getLoginPage);
router.get('/user-info',userController.getUserInformation);
router.get('/logout', userController.getLogout);
router.get('/sign-up', userController.getRegisterPage);
router.post('/sign-up', userController.postRegisterUser);
router.post(
  '/login',
  passport.authenticate('user-local', {
    successRedirect: '/',
    failureRedirect: '/login',
    successFlash: true,
    failureFlash: true
  })
);
router.get('/cart/delete/:id', userController.getDeleteProductInCart);
router.post('/cart/update/:id', userController.postUpdateQTYInCart);
router.get('/cart/:id', userController.getAddToCartSingle);
router.post('/cart/:id', userController.postAddToCartMulti);
router.get('/cart', userController.getCartPage);
router.get('/favorite', userController.getFavoritePage);
router.get('/favorite/page/:page', userController.getFavoriteAtPage);
router.get('/product/favorite/delete/:id', userController.getDeleteFavorite);
router.get('/product/favorite/:id', userController.getAddFavorite);
router.post('/checkout/bills', userController.postCheckout)
router.get('/checkout', userController.getCheckoutPage);
router.get('/search', userController.search);
router.get('/logout', userController.getLogout);
router.get('/', userController.index);

module.exports = router;