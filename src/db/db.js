const mongoose = require("mongoose");
const dotenv = require('dotenv')
dotenv.config()

const connectionURI = process.env.MONGODB_URI;

mongoose.connect(connectionURI)

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
    console.log("Connected to MongoDB database!");
});
