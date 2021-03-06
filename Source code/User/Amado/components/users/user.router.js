const express = require('express');
const router = express.Router();
const passport = require('passport');
const userController = require('../users/UserController');

router.get('/login', userController.getLoginPage);
router.get('/user-info',userController.getUserInformation);
router.get('/change-pass',userController.getChangePassword);
router.post('/change-pass',userController.postChangePassword);
router.post('/user-info',userController.postUserInformation);
router.get('/logout', userController.getLogout);
router.get('/sign-up', userController.getRegisterPage);
router.post('/sign-up', userController.postRegisterUser);
router.get('/confirmation/:token', userController.getConfirmEmail);
router.get('/confirm', userController.getConfirmPage);
router.get('/forgot-password', userController.getForgotPasswordPage);
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
router.get('/orders-manager', userController.getOrdersManagerPage);
router.get('/orders-manager/:page', userController.getOrdersManagerAtPage);
router.get('/orders-manager/details/:id', userController.getOrderDetails);

module.exports = router;