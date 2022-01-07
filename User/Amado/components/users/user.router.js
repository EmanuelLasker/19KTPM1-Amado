const express = require('express');
const router = express.Router();
const passport = require('passport');
const userController = require('../users/UserController');
const ExpressRedisCache = require('express-redis-cache');
const cache1 = ExpressRedisCache({
    expire: 60, // optional: expire every 10 seconds
})
const cache2 = ExpressRedisCache({
    expire: 5, // optional: expire every 10 seconds
})

router.get('/login',cache1.route(), userController.getLoginPage);
router.get('/user-info',cache2.route(),userController.getUserInformation);
router.get('/change-pass',cache1.route(),userController.getChangePassword);
router.post('/change-pass',userController.postChangePassword);
router.post('/user-info',userController.postUserInformation);
router.get('/logout', userController.getLogout);
router.get('/sign-up',cache1.route(), userController.getRegisterPage);
router.post('/sign-up', userController.postRegisterUser);
router.get('/confirmation/:token', userController.getConfirmEmail);
router.get('/confirm', userController.getConfirmPage);
router.get('/forgot-password',cache1.route(), userController.getForgotPasswordPage);
router.post('/send-password-email', userController.postSendPasswordEmail);
router.get('/reset-password/:email_token', userController.getResetPasswordPage);
router.post('/reset-password', userController.postResetPassword);
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
router.get('/cart',cache2.route(), userController.getCartPage);
router.get('/favorite',cache2.route(), userController.getFavoritePage);
router.get('/favorite/page/:page', userController.getFavoriteAtPage);
router.get('/product/favorite/delete/:id', userController.getDeleteFavorite);
router.get('/product/favorite/:id', userController.getAddFavorite);
router.post('/checkout/bills', userController.postCheckout)
router.get('/checkout',cache2.route(), userController.getCheckoutPage);
router.get('/search',cache1.route(), userController.search);
router.get('/logout', userController.getLogout);
router.get('/',cache2.route(), userController.index);
router.get('/orders-manager',cache2.route(), userController.getOrdersManagerPage);
router.get('/orders-manager/:page', userController.getOrdersManagerAtPage);
router.get('/orders-manager/details/:id', userController.getOrderDetails);

module.exports = router;