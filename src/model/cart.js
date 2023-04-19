// This file contains the code regarding the cart value
const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            index: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 0
        },
    }],
});

module.exports = mongoose.model("Cart", cartSchema);