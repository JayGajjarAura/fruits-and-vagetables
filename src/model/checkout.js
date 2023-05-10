// This file contains the code regarding Checkout
const mongoose = require("mongoose");

const CheckoutSchema = new mongoose.Schema({
        Quantity: {
            type: Number
        },
        itemeName: {
            type: String
        },
        subTotal: {
            type: Number
        }
});  

const Checkout = mongoose.model("Checkout", CheckoutSchema);

module.exports = Checkout;