const express = require('express');
const router = express.Router();

const productController = require('../products/ProductController');

router.get('/search', productController.search);
router.get('/:id', productController.productDetail);
router.get('/:id/page/:page', productController.productDetailAtPage);
router.get('/page/:page', productController.productAtPage);
router.post('/product-filter', productController.filterProduct);
router.get('/product-filter/:page', productController.filterProductAtPage)
router.get('/', productController.getProductDefault)
router.post('/:id', productController.postComment)

module.exports = router;