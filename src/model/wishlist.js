// This file contains the code regarding the cart value
const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema({
    User: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    Wishlist: [{
        Product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "product"
        },
        Created_at: {
            type: Date,
            default: Date.now()
        },
    }]
});  

const wishlist = mongoose.model("Wishlist", wishlistSchema);

module.exports = wishlist