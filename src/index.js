require("dotenv").config();
const express = require("express");
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const category = require("../Dynamic API/CategoryAdd")
const product = require('../Dynamic API/productAdd')
const hbs = require("hbs");
const fs = require('fs')
const path = require("path");
const multer = require('multer')
const session = require("express-session");
const user_data = require("./model/user");

const ObjectId = mongoose.Types.ObjectId;

require("./db/db");
const app = express();

//paths for express config
const publicDirectory = path.join(__dirname, "../public");
const viewsPath = path.join(__dirname, "../templates/views");
const partialsPath = path.join(__dirname, "../templates/partials");

// Setup handlebars engine and views location
app.set("view engine", "hbs");
app.set("views", viewsPath);
hbs.registerPartials(partialsPath);

app.use(express.urlencoded({ extended: false }));

// Setup static dictionary to serve
app.use(express.static(publicDirectory));

app.use(
    session({
        secret: "somekey",
        resave: false,
        saveUninitialized: true,
        cookie: { 
            secure: false,
            sameSite: 'none',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
        }, // Set the cookie to be non-secure for development purposes
    })
);

function getDefaultRenderData(req) {
    return {
        user: req.session.user || false
    };
}

const currencyLogo = "₹";

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "../public/uploads");
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "-" + Date.now() + ".jpg");
    },
});

let upload = multer({ storage: storage });

app.get('/category/name', async (req, res) => {
    try{
        const Category = await category.find({})
        res.render("test", { Category: Category });
        // res.json(Category)
    }catch(err){
        res.send('Error ' + err)
    }
})

app.get('/API/category/:id', async(req,res) => {
    try{
        const Category = await category.findById(req.params.id)
        res.json(Category)
    }catch(err){
        res.send('Error ' + err)
    }
})

app.post("/API/category", upload.single("image"), async (req, res) => {
    try {
        const { filename } = req.file;
        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;

        const newCategory = new category({
            name: req.body.name,
            status: req.body.status,
            image: imageUrl,
        });
        console.log(newCategory)

        await newCategory.save();

        res.json({ message: "Category added Successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).send("Error saving category");
    }
});

app.patch('/API/category/:id', upload.single("image"), async(req,res)=> {
    try{
        const Category = await category.findById(req.params.id); 

        Category.name = req.body.name || Category.name; // Update name
        Category.status = req.body.status || Category.status; // Update status

        if(req.file) { // Check if new image is uploaded
            const { filename } = req.file;
            const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
            Category.image = imageUrl; // Update image
        }

        const data = await Category.save();
        res.json(data);   
    }catch(err){
        res.status(500).send(err.message);
    }
})

app.get('/products', async (req, res) => {
    try{
        const Product = await product.find({})
        res.render("test", {Product: Product});
        // res.json(Product);
    }catch(err){
        res.send('Error ' + err)
    }
})

app.get('/API/products/:id', async(req,res) => {
    try{
        const Product = await product.findById(req.params.id);
        res.json(Product);
    }catch(err){
        res.send('Error ' + err)
    }
})


// code for rendering products in what's new section
app.get("/", async (req, res) => {
    const defaultRenderData = getDefaultRenderData(req);
    const currentCurrencyLogo = currencyLogo
    try {
        const Category = await category.find({}).limit(5);
        const newProducts = await product.find({ newProduct: true }).limit(5);
        const flashSale = await product.find({flashSale: true})
        const best_sellers = await product.find({}).limit(10)
        const topRated = await product.find({topRated: true}).limit(6)
        res.render("index", {
            defaultRenderData,
            currentCurrencyLogo: currentCurrencyLogo,            
            newProducts: newProducts,
            Category: Category,
            flashSale: flashSale,
            best_sellers: best_sellers,
            topRated: topRated,
        });
        console.log(defaultRenderData.user.username)
        // res.json(newProducts)
    } catch (err) {
        res.send("Error " + err);
    }
});

app.get('/category/:name', async (req, res) => {
    const defaultRenderData = getDefaultRenderData(req);
    
    try {
        const name = req.params.name;
        const Category = await category.findOne({ name: name });
        const categoryId = new ObjectId(Category._id);
        const products = await product.find({ category: categoryId });
        // res.json( products)
        res.render('category', {
            defaultRenderData, 
            products: products 
        });
    } catch (err) {
        res.send('Error ' + err);
    }
});

app.get('/products/:name', async (req, res) => {
    const defaultRenderData = getDefaultRenderData(req);
    const currentCurrencyLogo = currencyLogo;
    
    try {
        const title = req.params.name;
        const Product = await product.findOne({ title: title });
        const products = await product.find(Product);
        // Add the currencyLogo property to each product object
        // const productsWithCurrency = products.map((product) => {
        //     return {
        //         ...product.toObject(),
        //         currentCurrencyLogo: currencyLogo,
        //     };
        // });
        // res.json( products)
        res.render('product', {
            defaultRenderData, 
            currentCurrencyLogo: currentCurrencyLogo,
            products: products 
        });
        // console.log(products)
        // console.log(currencyLogo)
        // console.log(currentCurrencyLogo)
    } catch (err) {
        res.send('Error ' + err);
    }
});

app.post("/API/products", upload.single("image"), async (req, res) => {
    try {
        const { filename } = req.file;
        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;

        const newProduct = new product({
            category: req.body.category,
            title: req.body.title,
            price: req.body.price,
            image: imageUrl,
            description: req.body.description,
            newProduct: req.body.newProduct,
            flashSale: req.body.flashSale,
            topRated: req.body.topRated
        });
        console.log(newProduct)

        await newProduct.save();

        res.json({ message: "Product added Successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).send("Error saving Product");
    }
});

app.patch('/API/products/:id', upload.single("image"), async(req,res)=> {
    try{
        const Product = await product.findById(req.params.id); 

        Product.category = req.body.category || Product.category; // Update category
        Product.title = req.body.title || Product.title; // Update title
        Product.price = req.body.price || Product.price; // Update price
        Product.description = req.body.description || Product.description; // Update description
        Product.newProduct = req.body.newProduct || Product.newProduct // Update newProduct
        Product.flashSale = req.body.flashSale || Product.flashSale // Update flashSale
        Product.topRated= req.body.topRated || Product.topRated // Update topRated

        if(req.file) { // Check if new image is uploaded
            const { filename } = req.file;
            const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
            Product.image = imageUrl; // Update image
        }


        const data = await Product.save();
        res.json(data);   
    }catch(err){
        res.status(500).send(err.message);
    }
})

// app.get('/', (req,res) => {
//     let defaultRenderData = getDefaultRenderData(req);
//     res.render("index", defaultRenderData);
// })

app.post("/login", async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const user = await user_data.findOne({ email: email, password: password});

    try {
        if (user) {
            req.session.user = {
                username: user.username,
                userId: user._id,
            };
            res.redirect("/");
        } else {
            res.render("index", { error: "Invalid Email or password" });
        }
    } catch (error) {
        res.send(error.message);
    }
});

app.post("/form_data", async (req, res) => {
    const password = req.body.password;
    const confirm_pass = req.body.confirm_pass;

    try {
        if (password === confirm_pass) {
            const existingEmail = await user_data.findOne({
                email: req.body.email,
            });

            if (existingEmail) {
                return res.send("Email already exists!");
            }

            const entered_data = new user_data({
                username: req.body.username,
                email: req.body.email,
                password: req.body.password,
                confirm_pass: req.body.confirm_pass,
            });

            await entered_data.save();
            console.log(entered_data)
            res.redirect('/')
        } else {
            res.send("Passwords do not match");
        }
    } catch (error) {
        res.send(error);
    }
});

app.post('/add-to-cart', async (req, res) => {
    const { user, product } = req.body;
    const userId = new mongoose.Types.ObjectId(user);
    console.log(quantity)

    try {
        const cartItem = await cart_data.findOne({ user: userId, product: product});
        if (cartItem) {
            // If the item is already in the cart, update the quantity
            cartItem.quantity += 1;
            await cartItem.save();
            console.log(`Updated item in cart: ${cartItem}`);
            res.json(cartItem);
        } else {
            // Otherwise, create a new item in the cart
            const newCartItem = new cart_data({ user: userId, product: product, quantity: 1});
            await newCartItem.save();
            console.log(`Saved new item in cart: ${newCartItem}`);
            res.json(newCartItem);
        }
    } catch (err) {
        console.error(`Error saving item to cart: ${err}`);
        res.status(500).json({ error: err });
    }
});

app.get('/cart', (req, res) => {
    let defaultRenderData = getDefaultRenderData(req);
    res.render("cart", defaultRenderData);
});


app.get("/best_sellers", async (req, res) => {

    let defaultRenderData = getDefaultRenderData(req);
    try{
        const Product = await product.find({})
        res.render("best_sellers", {
            defaultRenderData,
            Product: Product
        });
        // res.json(Product);
    }catch(err){
        res.send('Error ' + err)
    }
});

app.post("/logout", (req, res) => { 
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/");
        }
    });
});

app.get("*", (req, res) => {
    let defaultRenderData = getDefaultRenderData(req);
    res.render('error 404', defaultRenderData)
});

app.listen(3000, () => {
    console.log("connected to server");
});