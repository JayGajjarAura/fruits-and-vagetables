require("dotenv").config();
const express = require("express");
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const category = require("../Dynamic API/CategoryAdd")
const product = require('../Dynamic API/productAdd')
const hbs = require("hbs");
const path = require("path");
const multer = require('multer')
const slugify = require('slugify')
const session = require("express-session");
const user_data = require("./model/user");
const cart_data = require("./model/cart");
const { title } = require("process");

const ObjectId = mongoose.Types.ObjectId;


require("./db/db");
const app = express()

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
            slug: slugify((req.body.name), {
                lower: true,
                strict: true
            })
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
        const updatedSlug = slugify(Category.name, {
            lower: true,
            strict: true
        });
        Category.slug = updatedSlug;

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

app.get('/category/:slug', async (req, res) => {
    const defaultRenderData = getDefaultRenderData(req);
    
    try {
        const slug = req.params.slug;
        const Category = await category.findOne({ slug: slug });
        const categoryId = new ObjectId(Category._id);
        const products = await product.find({ category: categoryId });
        // res.json( products)
        res.render("categoryWiseProducts", {
            defaultRenderData,
            products: products,
        });
    } catch (err) {
        res.send('Error ' + err);
    }
});

app.get('/products/:slug', async (req, res) => {
    const defaultRenderData = getDefaultRenderData(req);
    const currentCurrencyLogo = currencyLogo;
    
    try {
        const slug = req.params.slug;
        const Product = await product.findOne({ slug: slug });
        const products = await product.find(Product);

        res.render('product', {
            defaultRenderData, 
            currentCurrencyLogo: currentCurrencyLogo,
            products: products,
        });
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
            topRated: req.body.topRated,
            slug: slugify((req.body.title), {
                lower: true,
                strict: true
            })
        });
        console.log(newProduct.slug)

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
        // Product.slug = req.body.slug || Product.slug // Update slug

        if(req.file) { // Check if new image is uploaded
            const { filename } = req.file;
            const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
            Product.image = imageUrl; // Update image
        }

        const updatedSlug = slugify(Product.title, {
            lower: true,
            strict: true
        });
        Product.slug = updatedSlug;

        const data = await Product.save();
        res.json(data);   
    }catch(err){
        res.status(500).send(err.message);
    }
})

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


// app.get('/cart', (req, res) => {
//     let defaultRenderData = getDefaultRenderData(req);
//     res.render("cart", defaultRenderData);
// });

app.get('/whats-new', async (req, res) => {
    let defaultRenderData = getDefaultRenderData(req);
    
    try{
        const Product = await product.find({newProduct: true})
        res.render("newProducts", {
            defaultRenderData,
            Product: Product
        });
        // res.json(Product);
    }catch(err){
        res.send('Error ' + err)
    }
})

app.get('/categories', async (req, res) => {
    const defaultRenderData = getDefaultRenderData(req);
    
    try {
        const Category = await category.find({});
        
        // res.json(Category)
        res.render("allCategories", {
            defaultRenderData,
            Category: Category,
        });
    } catch (err) {
        res.send('Error ' + err);
    }
});

app.get("/best-sellers", async (req, res) => {

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

app.get('/top-rated', async (req, res) => {
    let defaultRenderData = getDefaultRenderData(req);
    
    try{
        const Product = await product.find({topRated: true})
        res.render("topRated", {
            defaultRenderData,
            Product: Product
        });
        // res.json(Product);
    }catch(err){
        res.send('Error ' + err)
    }
})

app.post("/logout", (req, res) => { 
    res.redirect("/");
});

app.get("*", (req, res) => {
    let defaultRenderData = getDefaultRenderData(req);
    res.render('error 404', defaultRenderData)
});

app.listen(3000, () => {
    console.log("connected to server");
});