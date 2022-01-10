const express = require('express');

const router = express.Router();
const categoriesController = require('../categories/CategoriesController');
// const ExpressRedisCache = require('express-redis-cache');
// const cache1 = ExpressRedisCache({
//     expire: 60, // optional: expire every 10 seconds
// })
// const cache2 = ExpressRedisCache({
//     expire: 5, // optional: expire every 10 seconds
// })

router.get('/:id',categoriesController.getList);
router.get('/:id/page/:page', categoriesController.getListAtPage);

module.exports = router;