const express = require('express');
const router = express.Router();
const session = require("express-session");

const order = require('../model/order')
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

router.get('/', async(req, res) => {
    let defaultRenderData = getDefaultRenderData(req);

    const userId = defaultRenderData.user.userId;

    if (!userId) {
        res.redirect('/');
    }

    try {

        const Address = await order.find({'User' :userId})
        const Category = await category.find({}).limit(5);

        // console.log('add--------', Address[0].order[0].Address)

        res.render("address", {
            defaultRenderData,
            Address: Address,
            Category: Category,
        });
    } catch (err) {
        res.send(err)
    }
})

router.patch('/update/:id', async (req, res) => {
    try {
        const addressId = req.params.id;
        const address = await order.findOne({'order.Address._id': addressId});

        if (!address) {
            return res.status(404).send("Address not found");
        }

        const updatedOrder = address.order.map(orderItem => {
            const updatedAddress = orderItem.Address.find(addr => addr._id.toString() === addressId);

            if (updatedAddress) {
                updatedAddress.Name = req.body.firstName + req.body.lastName || updatedAddress.Name;
                updatedAddress.contact_no = req.body.contactNumber || updatedAddress.contact_no;
                updatedAddress.house_no = req.body.houseNo || updatedAddress.house_no;
                updatedAddress.Area = req.body.area || updatedAddress.Area;
                updatedAddress.city = req.body.city || updatedAddress.city;
                updatedAddress.state = req.body.state || updatedAddress.state;
                updatedAddress.pincode = req.body.pincode || updatedAddress.pincode;
            }

            return orderItem;
        });

        address.order = updatedOrder;
        await address.save();

        res.status(200).json({ message: "Address updated successfully" });
    } catch (err) {
        res.status(500).json({ error: "Error updating address" });
    }
});

module.exports = router