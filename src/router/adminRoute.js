const express = require('express');
const router = express.Router();
const session = require("express-session");

const admin = require('../model/adminSchema');
const category = require('../model/CategoryAdd');
const product = require('../model/productAdd')

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

const auth = (req, res, next) => {
    const userId = req.session.user?.userId

    if (!userId) {
        return res.redirect('/admin')
    }
    next()
}

// function getDefaultRenderData(req) {
//     return {
//         user: req.session.user || false
//     };
// }

router.get('/', (req, res) => {
    res.render('admin')
})

router.post("/adminLogin", async (req, res) => {
    const email = req.body.email;
    // console.log("mailllllllll", email);

    const password = req.body.password;
    // console.log("passssssss", password);

    const user = await admin.findOne({email: email, password: password});
    // console.log('userrrrrr-------admin', user);

    try {
        if (user) {
            req.session.user = {
                username: user.username,
                userId: user._id,
            };
            res.status(200).redirect('/admin/dashboard');
        } else {
            res.status(401).send({ error: "Invalid email or password" });
        }
    } catch (error) {
        res.send(error.message);
    }
});


router.get('/dashboard', auth, (req, res) => {
    // let defaultRenderData = getDefaultRenderData(req);

    // const userId = defaultRenderData.user.userId;

    // if(!userId) {
    //     res.redirect('/admin')
    // }

    // res.send('dashboard')
    try {
        res.render('dashboard', {
            defaultRenderData
        })
    } catch (err) {
        res.send(err)
    }
})

router.get('/product-add', auth ,async (req, res) => {
    // res.send('productAdd')

    // let defaultRenderData = getDefaultRenderData(req);

    // const userId = defaultRenderData.user.userId;

    // if(!userId) {
    //     res.redirect('/admin')
    // }

    try {

        const Category = await category.find({})
        res.render('productAdd', {
            defaultRenderData,
            Category: Category
        })
    } catch (err) {
        res.send(err)
    }
})

router.get('/product-list', async (req, res) => {
    // res.send('productView')

    let defaultRenderData = getDefaultRenderData(req);

    const userId = defaultRenderData.user.userId;

    if(!userId) {
        res.redirect('/admin')
    }

    try {
        const Products = await product.find().sort({ title: 1 });
        const Category = await category.find().sort({ name: 1 });
        res.render('productView', {
            defaultRenderData,
            Products: Products,
            Category: Category
        })
    } catch (err) {
        res.send(err)
    }
})

router.get('/category-add', (req, res) => {
    // res.send('categoryAdd')
    let defaultRenderData = getDefaultRenderData(req);

    const userId = defaultRenderData.user.userId;

    if(!userId) {
        res.redirect('/admin')
    }

    try {
        res.render('categoryAdd', {
            defaultRenderData
        })
    } catch (err) {
        res.send(err)
    }
})

router.get('/category-list', async (req, res) => {
    // res.send('categoryView')
    let defaultRenderData = getDefaultRenderData(req);

    const userId = defaultRenderData.user.userId;

    if(!userId) {
        res.redirect('/admin')
    }

    try {
        const Category = await category.find({}).sort({name: 1})

        const categoryData = await Promise.all(Category.map(async (category) => {
            const totalProducts = await product.countDocuments({ category });
            return { ...category.toObject(), totalProducts };
        }));

        // console.log('count-----------', categoryData)

        res.render('categoryView', {
            defaultRenderData,
            categoryData: categoryData,
        })
    } catch (err) {
        res.send(err,'error')
    }
})

router.post("/logout", (req, res) => { 
    req.session.destroy(function (err) {
        res.redirect("/admin");
    });
});

module.exports = router;
