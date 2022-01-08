const express = require('express');
const router = express.Router();

const productController = require('../products/ProductController');
const ExpressRedisCache = require('express-redis-cache');
const cache1 = ExpressRedisCache({
    expire: 60, // optional: expire every 10 seconds
})
const cache2 = ExpressRedisCache({
    expire: 5, // optional: expire every 10 seconds
})
router.get('/search',cache1.route(), productController.search);
router.get('/:id', productController.productDetail);
router.get('/:id/page/:page', productController.productDetailAtPage);
router.get('/page/:page', productController.productAtPage);
router.post('/product-filter', productController.filterProduct);
router.get('/product-filter/:page', productController.filterProductAtPage)
router.get('/',cache1.route(), productController.getProductDefault)
router.post('/:id', productController.postComment)

module.exports = router;