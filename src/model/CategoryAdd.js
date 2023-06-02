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
    active: {
        type: Boolean,
        required: true,
        default: true
    },
    slug: {
        type: String
    }
})

const category = mongoose.model("category", categorySchema);

module.exports = category;
