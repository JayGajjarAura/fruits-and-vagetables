const express = require("express");
const router = express.Router();
const session = require("express-session");
const mongoose = require("mongoose");

const product = require('../model/productAdd')
const category = require('../model/CategoryAdd')
const wishlist = require('../model/wishlist')
const ObjectId = mongoose.Types.ObjectId;

router.use(
    session({
        secret: "somekey",
        resave: false,
        saveUninitialized: true,
        cookie: {
            secure: false,
            sameSite: "lax",
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
        }, // Set the cookie to be non-secure to run in local
    })
);

function getDefaultRenderData(req) {
    return {
        user: req.session.user || false
    };
}


router.get("/", async (req, res) => {
    const defaultRenderData = getDefaultRenderData(req);
    const totalQuantity = req.session.totalQuantity;

    try {
        const Category = await category.find({ active: true }).limit(5);
        const newProducts = await product.find({ newProduct: true, active: true }).limit(5);
        const flashSale = await product.find({ flashSale: true, active: true }).limit(6);
        const best_sellers = await product.find({ active: true }).limit(10);
        const topRated = await product.find({topRated: true, active: true}).limit(6)
        res.render("index.hbs", {
            defaultRenderData,
            totalQuantity,           
            newProducts: newProducts,
            Category: Category,
            flashSale: flashSale,
            best_sellers: best_sellers,
            topRated: topRated,
        });
        // console.log(defaultRenderData.user.username)
        // res.json(newProducts)
    } catch (err) {
        res.send("Error " + err);
    }
});

router.get('/category/:slug', async (req, res) => {
    const defaultRenderData = getDefaultRenderData(req);
    // console.log("------------------", req.body.name);
    
    try {
        const slug = req.params.slug;
        const Category = await category.findOne({ slug: slug, active: true });
        const categoryId = new ObjectId(Category._id);
        const products = await product.find({ category: categoryId, active: true });
        // res.json( products)
        res.render("categoryWiseProducts", {
            defaultRenderData,
            products: products,
            Category: Category,
        });
    } catch (err) {
        res.send('Error ' + err);
    }
});

router.get("/products/:slug", async (req, res) => {
    const defaultRenderData = getDefaultRenderData(req);

    try {
        const slug = req.params.slug;
        const Product = await product.findOne({ slug: slug, active: true });
        const Category = await category.find({ active: true }).limit(5);

        const userId = defaultRenderData.user.userId;
        let isProductInWishlist = false;

        if (userId) {
            const Wishlist = await wishlist.findOne({ User: userId });
            if (Wishlist) {
                isProductInWishlist = Wishlist.Wishlist.some((item) =>
                    item.Product && item.Product.toString() === Product._id.toString()
                );
            }
        }

        res.render("product", {
            defaultRenderData,
            products: Product,
            Category: Category,
            isProductInWishlist: isProductInWishlist,
        });
    } catch (err) {
        res.send("Error " + err);
    }
});

router.get('/whats-new', async (req, res) => {
    let defaultRenderData = getDefaultRenderData(req);
    const Category = await category.find({}).limit(5);
    
    try{
        const Product = await product.find({ newProduct: true, active: true });
        res.render("newProducts", {
            defaultRenderData,
            Product: Product,
            Category: Category
        });
        // res.json(Product);
    }catch(err){
        res.send('Error ' + err)
    }
})

router.get('/categories', async (req, res) => {
    const defaultRenderData = getDefaultRenderData(req);
    
    try {
        const Category = await category.find({ active: true });
        
        // res.json(Category)
        res.render("allCategories", {
            defaultRenderData,
            Category: Category,
        });
    } catch (err) {
        res.send('Error ' + err);
    }
});

router.get("/best-sellers", async (req, res) => {

    let defaultRenderData = getDefaultRenderData(req);
    const Category = await category.find({ active: true }).limit(5);

    try{
        const Product = await product.find({active: true})
        res.render("best_sellers", {
            defaultRenderData,
            Product: Product,
            Category: Category
        });
        // res.json(Product);
    }catch(err){
        res.send('Error ' + err)
    }
});

router.get('/top-rated', async (req, res) => {
    let defaultRenderData = getDefaultRenderData(req);
    const Category = await category.find({}).limit(5);
    
    try{
        const Product = await product.find({ topRated: true, active: true });
        res.render("topRated", {
            defaultRenderData,
            Product: Product,
            Category: Category
        });
        // res.json(Product);
    }catch(err){
        res.send('Error '+ err)
    }
})

router.get('/thanks', async (req, res) => {
    let defaultRenderData = getDefaultRenderData(req);

    const userId = defaultRenderData.user.userId;

    if (!userId) {
        res.redirect('/');
    }

    try {
        const Category = await category.find({}).limit(5);

        res.render('thanks', {
            defaultRenderData,
            Category: Category,
        })
    } catch (err) {
        res.send('Error' + err)
    }
})

router.get('/cancel', async (req, res) => {
    let defaultRenderData = getDefaultRenderData(req);

    const userId = defaultRenderData.user.userId;

    if (!userId) {
        res.redirect('/');
    }

    try {

        const Category = await category.find({}).limit(5);

        res.render('cancel', {
            defaultRenderData,
            Category: Category,
        })
    } catch (err) {
        res.send('Error' + err)
    }
})

router.post("/logout", (req, res) => { 
    req.session.destroy(function (err) {
        res.redirect("/");
    });
});

module.exports = router