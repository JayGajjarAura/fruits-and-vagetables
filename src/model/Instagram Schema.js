// Instagram Schema------------

const userSchema = new Schema({
    username: {
        type: String,
        unique: true
    },
    Name: {
        type: String
    },
    email: {
        type: String,
    },
    MobileNumber: {
        type: Number
    },
    password: {
        type: String,
    },
    Bio: {
        type: String
    }
});