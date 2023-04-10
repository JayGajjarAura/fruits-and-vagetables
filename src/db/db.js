const mongoose = require("mongoose");
const connectionURI =  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/Fruits_and_vagetables";

mongoose.connect(connectionURI)

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
    console.log("Connected to MongoDB database!");
});
