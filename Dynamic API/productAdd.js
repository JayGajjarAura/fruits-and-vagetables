const mongoose = require('mongoose')
const category = require('./CategoryAdd')

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
        required: true
    },
    newProduct: {
        type: Boolean
    },
    flashSale: {
        type: Boolean
    },
    topRated: {
        type: Boolean
    },
    slug: {
        type: String
    }
})

const product = mongoose.model('product', productSchema)

module.exports = product