const express = require("express");
const router = express.Router();

const product = require('../model/productAdd')

router.get('/', async (req, res) => {
    const query = req.query.term;
    try {
        const products = await product.find({});

        // Filter products using fuzzy search
        const results = fuzzy.filter(query, products, {
            extract: (p) => p.title // Use product titles for the fuzzy search
        });

        const suggestions = results.map((search) => ({
            title: search.original.title,
            slug: search.original.slug,
            url: `/${encodeURIComponent(search.original.slug)}`, // URL of search result page for product
        }));

        res.send(suggestions);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router