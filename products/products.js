const mongoose = require('mongoose')
const product = require('../src/model/products')

mongoose.connect("mongodb://127.0.0.1:27017/Fruits_and_vagetables")

const db = mongoose.connection

db.once("open", function () {
  console.log("Connected to MongoDB database!");
});

const products = [
    new product({
        ImagePath: "./Images/red-carot.jpg",
        name: "Red Carot",
        price: 99.99,
    }),
    new product({
        ImagePath: "./Images/red-carot.jpg",
        name: "Red Carot",
        price: 99.99,
    }),
    new product({
        ImagePath: "./Images/red-carot.jpg",
        name: "Red Carot",
        price: 99.99,
    }),
    new product({
        ImagePath: "./Images/red-carot.jpg",
        name: "Red Carot",
        price: 99.99,
    }),
    new product({
        ImagePath: "./Images/red-carot.jpg",
        name: "Red Carot",
        price: 99.99,
    }),
    new product({
        ImagePath: "./Images/red-carot.jpg",
        name: "Red Carot",
        price: 99.99,
    }),
    new product({
        ImagePath: "./Images/red-carot.jpg",
        name: "Red Carot",
        price: 99.99,
    }),
    new product({
        ImagePath: "./Images/red-carot.jpg",
        name: "Red Carot",
        price: 99.99,
    }),
    new product({
        ImagePath: "./Images/red-carot.jpg",
        name: "Red Carot",
        price: 99.99,
    }),
    new product({
        ImagePath: "./Images/red-carot.jpg",
        name: "Red Carot",
        price: 99.99,
    }),
    new product({
        ImagePath: "./Images/red-carot.jpg",
        name: "Red Carot",
        price: 99.99,
    }),
    new product({
        ImagePath: "./Images/red-carot.jpg",
        name: "Red Carot",
        price: 99.99,
    }),
    new product({
        ImagePath: "./Images/red-carot.jpg",
        name: "Red Carot",
        price: 99.99,
    }),
    new product({
        ImagePath: "./Images/red-carot.jpg",
        name: "Red Carot",
        price: 99.99,
    }),
    new product({
        ImagePath: "./Images/red-carot.jpg",
        name: "Red Carot",
        price: 99.99,
    }),
    new product({
        ImagePath: "./Images/red-carot.jpg",
        name: "Red Carot",
        price: 99.99,
    }),
    new product({
        ImagePath: "./Images/red-carot.jpg",
        name: "Red Carot",
        price: 99.99,
    }),
    new product({
        ImagePath: "./Images/red-carot.jpg",
        name: "Red Carot",
        price: 99.99,
    }),
    new product({
        ImagePath: "./Images/red-carot.jpg",
        name: "Red Carot",
        price: 99.99,
    }),
    new product({
        ImagePath: "./Images/red-carot.jpg",
        name: "Red Carot",
        price: 99.99,
    }),
    new product({
        ImagePath: "./Images/red-carot.jpg",
        name: "Red Carot",
        price: 99.99,
    }),
    new product({
        ImagePath: "./Images/red-carot.jpg",
        name: "Red Carot",
        price: 99.99,
    }),
    new product({
        ImagePath: "./Images/red-carot.jpg",
        name: "Red Carot",
        price: 99.99,
    }),

];

// let done = 0;


// for (let i = 0; i < product.length; i++) {
//     const Product = products[i];
//     Product.save(function(err, result) {
//         done++;
//         if(done === products.length)
//         exit();
//     });
// }

let done = 0;

for (let i = 0; i < products.length; i++) {
  const product = products[i];
  product.save()
        .then(() => {
            done++;
            if (done === products.length) {
                console.log("All products saved");
                exit()
                // do something else here to indicate the operation has finished
            }
        })
        .catch((err) => {
        console.error(`Error saving product ${product._id}: ${err}`);
    });
}


function exit() {
    mongoose.disconnect();
}