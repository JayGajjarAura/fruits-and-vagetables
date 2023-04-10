const express = require('express');
const router = express.Router();
const Product = require('../models/product');

router.get('/', async (req, res, next) => {
    try {
        const successMsg = req.flash('success')[0];
        const products = await Product.find().lean();
        const productChunks = [];
        const chunkSize = 3;
        for (let i = 0; i < products.length; i += chunkSize) {
            productChunks.push(products.slice(i, i + chunkSize));
        }
        res.render('shop/index', {title: 'Shopping cart', products: productChunks, successMsg: successMsg, noMessage: successMsg});
    } catch (error) {
        next(error);
    }
});

module.exports = router;