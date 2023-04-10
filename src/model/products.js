// this file contains the code regarding the product schema

const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    ImagePath: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
})

module.exports = mongoose.model('Product', productSchema)