const mongoose = require('mongoose')

const productSchema = mongoose.Schema ({
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    newProduct: {
        type: Boolean,
        default: false
    },
    flashSale: {
        type: Boolean,
        default: false
    },
    topRated: {
        type: Boolean,
        default: false
    },
    active: {
        type: Boolean,
        default: true
    },
    slug: {
        type: String,
        default: false
    }
})

const product = mongoose.model('product', productSchema)

module.exports = product