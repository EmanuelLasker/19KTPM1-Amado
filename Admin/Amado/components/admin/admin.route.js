const express = require('express');
const passport = require('passport');
const router = express.Router();
const adminController = require('../admin/AdminController');

const multer = require('multer');
const { getLogout } = require('../admin/AdminController');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
});

const uploadMulti = multer({ storage: storage, limits: { fieldSize: 1024 * 5 } });
const uploadSingle = multer({ storage: storage, limits: { fieldSize: 1024 * 5 } });

// Admin

// PRODUCT MANAGER
router.post('/dashboard/products-manager/add', uploadMulti.array('imagelist', 4), adminController.postAddProduct);
router.get('/dashboard/products-manager/add', adminController.getAddProductPage);

// Update product info
router.post('/dashboard/products-manager/update/:id', uploadMulti.array('imagelist', 4), adminController.postUpdateProductPage);
router.get('/dashboard/products-manager/update/:id', adminController.getUpdateProductPage);
// Delete product info
router.get('/dashboard/products-manager/delete/:id', adminController.getDeleteProductInfo);
// Hide product info
router.get('/dashboard/products-manager/hide/:id', adminController.getHideProductInfo);

// CATEGORIES MANAGER

// Get and Add categories
router.post('/dashboard/categories-manager/add', uploadSingle.single('thumbnail'), adminController.postAddCategories);
router.get('/dashboard/categories-manager/add', adminController.getAddCategoriesPage);
// Get categories manager page
router.get('/dashboard/categories-manager/:page', adminController.getCategoriesManagerAtPage);
router.get('/dashboard/categories-manager/', adminController.getCategoriesManagerPage);
// Update categories info
router.post('/dashboard/categories-manager/update/:id', uploadSingle.single('thumbnail'), adminController.postUpdateCategoriesPage);
router.get('/dashboard/categories-manager/update/:id', adminController.getUpdateCategoriesPage);
// Delete categories info
router.get('/dashboard/categories-manager/delete/:id', adminController.getDeleteCategoriesInfo);

// Order Manager
// 1. Pending
router.get('/dashboard/pending-order-manager/update/:id', adminController.getUpdateStatusOrder);
router.get('/dashboard/pending-order-manager/delete/:id', adminController.getDeleteStatusOrder);
router.get('/dashboard/pending-order-manager/update-all', adminController.getUpdateAllStatusOrder);
router.get('/dashboard/pending-orders-manager/:page', adminController.getPendingOrderAtPage);
router.get('/dashboard/pending-orders-manager', adminController.getPendingOrderPage);
router.get('/dashboard/orders-manager', adminController.getOrdersManagerPage);
// 2. Order
router.get('/dashboard/orders-manager/update/:id', adminController.getUpdateOrder);
router.post('/dashboard/orders-manager/update/:id', adminController.postUpdateOrder);
router.get('/dashboard/orders-manager/delete/:id', adminController.getDeleteOrder);

// GET Dashboard, Pagination
router.get('/dashboard/products-manager/:page', adminController.getProductManagerAtPage);
router.get('/dashboard/products-manager/', adminController.getProductManagerPage);
router.get('/dashboard', adminController.getDashboardPage);

router.get('/login', adminController.getLoginPage);
router.post('/login', passport.authenticate('admin-local', {failureRedirect: '/admin/login', successFlash: true, failureFlash: true}), adminController.getDashboardPage);
router.get('/', adminController.getLoginPage);

router.get('/sign-up', adminController.getSignUpPage);
router.post('/sign-up', adminController.postSignUpUser);

router.get('/dashboard/admin-list/:page', adminController.getAdminListAtPage);
router.get('/dashboard/admin-list/', adminController.getAdminListPage);

router.get('/profile', adminController.getAdminProfile);
router.post('/profile/:id', uploadSingle.single('thumbnail'), adminController.postAdminProfile);

// User Manager
router.get('/dashboard/users-manager/:page', adminController.getUserListAtPage);
router.get('/dashboard/users-manager/', adminController.getUserListPage);

router.post('/dashboard/users-manager/update/:id', uploadSingle.single('thumbnail'), adminController.postUpdateUserPage);
router.get('/dashboard/users-manager/update/:id', adminController.getUpdateUserPage);

router.get('/dashboard/users-manager/delete/:id', adminController.getDeleteUserInfo);
router.get('/dashboard/users-manager/lock/:id', adminController.getLockUser);
router.get('/dashboard/users-manager/unlock/:id', adminController.getUnlockUser);

// Admin Manager
router.get('/dashboard/admin-list/lock/:id', adminController.getLockAdmin);
router.get('/dashboard/admin-list/unlock/:id', adminController.getUnlockAdmin);

// Logout
router.get('/dashboard/logout', getLogout);

module.exports = router;