const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
    // _id: Schema.Types.ObjectId,
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        // Validate email format using regex
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
        type: String,
        required: true,
    },
});

// Use singular collection name for user model
const User = mongoose.model("user", userSchema);

module.exports = User;
