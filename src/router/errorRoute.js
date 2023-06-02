const express = require("express");
const router = express.Router();
const session = require("express-session");

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

router.get("*", async (req, res) => {
    let defaultRenderData = getDefaultRenderData(req);
    try  {
        const Category = await category.find({}).limit(5);

        res.render('error 404', {
            defaultRenderData,
            Category: Category
        })
    } catch (err) {
        res.send('Error' + err);
    }
});

module.exports = router