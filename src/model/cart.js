// This file contains the code regarding the cart value
const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
    User: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    Cart_products: [{
        User_cart_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        Product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        },
        Quantity: {
            type: Number
        },
        Created_at: {
            type: Date,
            default: Date.now()
        },
        Updated_at: {
            type: Date,
            default: Date.now()
        }
    }]
});  

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart