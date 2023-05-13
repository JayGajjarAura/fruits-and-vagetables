// This file contains the code regarding Checkout
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    User: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    order: [{
        user_order_id: {
            type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        },
        Quantity: {
            type: mongoose.Schema.Types.Mixed
        },
        itemName: {
            type: mongoose.Schema.Types.Mixed
        },
        subTotal: {
            type: mongoose.Schema.Types.Mixed
        },
        // grandTotal: {
        //     type: mongoose.Schema.Types.Mixed
        // },
        ordered_on: {
            type: Date,
            default: Date.now()
        }
    }]
});  

const order = mongoose.model("order", orderSchema);

module.exports = order;