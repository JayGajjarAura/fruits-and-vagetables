const express = require('express');
const router = express.Router();
const session = require("express-session")

const order = require('../model/order')

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
    const defaultRenderData = getDefaultRenderData(req);

    const userID = defaultRenderData.user.userId;
    if (!userID) {
        res.redirect('/');
    }

    try {
        const orders = await order.find({ User: userID }).sort({ordered_on: -1});

        if (!orders) {
            throw new Error('User orders not found');
        }

        res.render('orders', {
            defaultRenderData,
            orders,
        });
    } catch (err) {
        console.error(err);
    }
});

router.get('/:Order_Id', async (req, res) => {
    const defaultRenderData = getDefaultRenderData(req);

    const userID = defaultRenderData.user.userId;

    const orderID = req.params.Order_Id
    if (!userID) {
        res.redirect('/');
    }

    try {

        const Order = await order.find({ Order_Id: orderID }).lean().populate({
            path: "order.Product",
            model: "product",
        })


        // console.log('orderrrrrr---------', Order)
        res.render('orderDetail', {
            defaultRenderData,
            Order: Order
        })
    } catch(err) {
        console.log(err)
    }
})

module.exports = router