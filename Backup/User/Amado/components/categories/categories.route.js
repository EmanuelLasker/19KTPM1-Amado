const express = require('express');

const router = express.Router();
const categoriesController = require('../categories/CategoriesController');

router.get('/:id', categoriesController.getList);
router.get('/:id/page/:page', categoriesController.getListAtPage);

module.exports = router;