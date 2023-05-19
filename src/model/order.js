// This file contains the code regarding Checkout
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    User: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    Order_Id: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
    },
    ordered_on: {
        type: Date,
        default: Date.now()
    },
    Total_items: {
        type: Number
    },
    Total_amount: {
        type: Number
    },
    order: [{
        user_order_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        Quantity: {
            type: Array
        },
        itemName: {
            type: Array
        },
        subTotal: {
            type: Array
        },
        Address: [{
            Name: {
                type: String,
                trim: true
            },
            contact_no: {
                type: Number
            },
            house_no: {
                type: mongoose.Schema.Types.Mixed
            },
            Area: {
                type: String
            },
            city: {
                type: String
            },
            state: {
                type: String
            },
            pincode: {
                type: Number
            }

        }]
        // grandTotal: {
        //     type: mongoose.Schema.Types.Mixed
        // },
    }]
});  

const order = mongoose.model("order", orderSchema);

module.exports = order;