const mongoose = require("mongoose");
require('../db/db');
const Product = require("./products");
const Cart = require("./order");

  //............. ADD TO CART TOAST...........
$(".add_to_cart_toast").click(async function () {
    let cart_toast_info = $(this).parent().find("input").val();

    // Get the product data from your data source
    const productId = $(this).data('product-id'); // 'data-product-id' attribute on the button
    const productData = await getProductData(productId); // implement this function to fetch product data from your data source

    // Create a new Product instance with the retrieved product data
    const newProduct = new Product({
        name: productData.name,
        quantity: cart_toast_info,
        price: productData.price,
    });

    // Save the new product to the database
    try {
        const savedProduct = await newProduct.save();
        console.log(savedProduct); // Log the saved product to the console
    } catch (error) {
        console.error(error); // Handle any errors that may occur
    }

    // Create a new Cart instance with the user's ID and the new Product instance
    const newCart = new Cart({
        items: [{
            user: req.user._id, // assuming you have a 'user' property on the request object
            product: newProduct._id,
            quantity: cart_toast_info,
            price: productData.price,
        }],
    });

    // Save the new cart to the database
    try {
        const savedCart = await newCart.save();
        console.log(savedCart); // Log the saved cart to the console
    } catch (error) {
        console.error(error); // Handle any errors that may occur
    }

    document.getElementById("add_to_cart_toast").innerHTML =  cart_toast_info + " items added to your cart...";

    if (cart_toast_info < 1) {
        alert("Cannot add ZERO quantity in cart ");
    } else {
        $(".cart_toast").toast("show");

    }
});