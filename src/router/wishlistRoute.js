const express = require('express');
const router = express.Router();
const session = require("express-session")

const wishlist = require('../model/wishlist')
const category = require('../model/CategoryAdd')

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

router.get('/', async (req, res) => {
    let defaultRenderData = getDefaultRenderData(req);

    const userId = defaultRenderData.user.userId;

    // if (!userId) {
    //     res.redirect('/');
    // }

    try {
        const Wishlist = await wishlist.find({ User: userId }).lean().populate({
            path: "Wishlist.Product",
            model: "product",
        });
        const Category = await category.find({}).limit(5);

        // console.log('wishlistttt-------', Wishlist[0].Wishlist)

        res.render("wishlist", {
            defaultRenderData,
            Wishlist: Wishlist,
            Category: Category,
        });
    } catch (err) {
        res.send('Error' + err);
    }
});

router.post("/toggle/:id", async (req, res) => {
    const defaultRenderData = getDefaultRenderData(req);

    try {
        const userId = defaultRenderData.user.userId;

        if (!userId) {
            res.redirect("/");
            return;
        }

        const productId = req.params.id;

        let Wishlist = await wishlist.findOne({ User: userId });

        if (!Wishlist) {
            Wishlist = new wishlist({ User: userId, Wishlist: [] });
        }

        const productExistsIndex = Wishlist.Wishlist.findIndex((item) =>
            item.Product?.equals?.(productId)
        );

        if (productExistsIndex !== -1) {
            // Product already exists in the wishlist, remove it
            Wishlist.Wishlist.splice(productExistsIndex, 1);
        } else {
            // Product doesn't exist in the wishlist, add it
            Wishlist.Wishlist.push({ Product: productId });
        }

        await Wishlist.save();

        // Return the updated wishlist status
        res.json({ isInWishlist: productExistsIndex === -1 });
    } catch (error) {
        console.error("Error adding/removing product to/from wishlist:", error);
        // Send an error response
        res.status(500).send("An error occurred");
    }
});

router.post('/remove/:id', async (req, res) => {
    const rowID = req.params.id;
    try {
        const wishlistItem = await wishlist.findOne({ 'Wishlist._id': rowID });
        // console.log('wishlistItem-------------------', wishlistItem);
        
        if (!wishlistItem) {
            return res.status(404).send('Product not found in wishlist');
        }
        
        // Remove the product from the Wishlist array
        wishlistItem.Wishlist = wishlistItem.Wishlist.filter(item => item._id.toString() !== rowID);
        
        await wishlistItem.save();
        
        res.redirect('/wishlist');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router