const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema ({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    status: {
        type: Number,
        required: true,
        default: 2
    },
    slug: {
        type: String
    }
})

const category = mongoose.model("category", categorySchema);

module.exports = category;
