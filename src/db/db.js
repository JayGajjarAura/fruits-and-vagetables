const mongoose = require("mongoose");
const connectionURI = "mongodb+srv://JayGajjarAura:J104aura%40mongodb@cluster0.kdhaofx.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(connectionURI)

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
    console.log("Connected to MongoDB database!");
});
