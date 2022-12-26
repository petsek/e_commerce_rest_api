const express = require('express');
const router = express.Router();
const productQ = require('../Queries/productQ');

router.get('/', productQ.getProducts);
router.get('/:id', productQ.getProductById);

module.exports = router;