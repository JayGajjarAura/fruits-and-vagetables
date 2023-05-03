require("dotenv").config()
const express = require("express")
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const category = require("../Dynamic API/CategoryAdd")
const product = require('../Dynamic API/productAdd')
const hbs = require("hbs")
const path = require("path")
const multer = require('multer')
const slugify = require('slugify')
const nodemailer = require("nodemailer")
const session = require("express-session")
const user_data = require("./model/user")
const cart = require("./model/cart")

const ObjectId = mongoose.Types.ObjectId;

// const trigger = require('../public/JS/triggerClick')

require("./db/db");
const app = express()

hbs.registerHelper("multiply", function (a, b) {
    return a * b;
});

//paths for express config
const publicDirectory = path.join(__dirname, "../public");
const viewsPath = path.join(__dirname, "../templates/views");
const partialsPath = path.join(__dirname, "../templates/partials");

// Setup handlebars engine and views location
app.set("view engine", "hbs");
app.set("views", viewsPath);
hbs.registerPartials(partialsPath);

//Body-parser middle were
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

// Generate a random token for verification
function generateToken() {
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    return token;
}

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
        }, // Set the cookie to be non-secure to run in local
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


// -----------cart CRUD operations code----------

app.get('/cart', async (req, res) => {
    let defaultRenderData = getDefaultRenderData(req);

    const userId = defaultRenderData.user.userId;
    console.log('user---------'+ userId)
    if(!userId) {
        res.redirect('/')
    }

    try {
        const Category = await category.find({})
        const Cart = await cart.findOne({User: userId }).lean().populate({
            path: "Cart_products.Product",
            model: "product",
        });
        // const Cart = await cart.findOne({User: userId})
        // console.log('cartttttttttttt---  ' + JSON.stringify( Cart));
        res.render('cart', {
            defaultRenderData,
            Cart: Cart,
            Category: Category
        });
    } catch (err) {
        // console.error(err);
        res.send(err);
    }
});

app.post('/add-to-cart', async (req, res) => {
    const defaultRenderData = getDefaultRenderData(req);

    try {
        const userId = defaultRenderData.user.userId;

        let Cart = await cart.findOne({ User: userId });
        console.log('sdsdasdsadsad'+ Cart)

        if (!Cart) {
            const newCart = new cart({
                User: userId,
                Cart_products: [
                    {
                        User_cart_id: userId,
                        Product: req.body.productId,
                        Quantity: req.body.quantity,
                        Created_at: Date.now(),
                    },
                ],
            });

            await newCart.save();
            console.log(newCart);
        } else {
            const cartProductIndex = Cart.Cart_products.findIndex((item) =>
                item.Product.equals(req.body.productId)
            );

            if (cartProductIndex >= 0) {
                // Update quantity for existing cart product
                const cartProduct = Cart.Cart_products[cartProductIndex];
                cartProduct.Quantity = req.body.quantity;
                cartProduct.Updated_at = Date.now();

                // Remove cart product if new quantity is 0
                if (req.body.quantity === 0) {
                    Cart.Cart_products.splice(cartProductIndex, 1);
                }
            } else {
                // Add new cart product
                Cart.Cart_products.push({
                    User_cart_id: userId,
                    Product: req.body.productId,
                    Quantity: req.body.quantity,
                    Created_at: Date.now(),
                    Updated_at: Date.now()
                });
            }

            await Cart.save();
            console.log(Cart);
        }
        
        // res.send({ Success: 'Product added to cart successfully'});
        res.redirect('/cart');
    } catch (err) {
        console.log('error'+ err);
        res.status(500).send('Error adding product to cart');
    }
});

app.post('/cart/remove/:id', async(req, res) => {
    const rowID = req.params.id
    const product = await cart.findOne({ 'Cart_products._id': rowID })
    console.log('product-------------------',product)

    if (!product) {
        return res.status(404).send('Product not found in cart')
    }

    // remove the product from the Cart_products array
    product.Cart_products = product.Cart_products.filter(item => item._id.toString() !== rowID)

    await product.save()

    res.redirect('/cart')
})

app.post('/cart/increment/:id', async (req, res) => {
    const productId = req.params.id;
    const findId = await cart.findOne({ "Cart_products._id": productId });
    if (findId) {
        const productQty = findId.Cart_products.find(item => item._id.toString() === productId).Quantity;
        const newProductQty = productQty + 1;
        findId.Cart_products.find(item => item._id.toString() === productId).Quantity = newProductQty;
        await findId.save();
        res.redirect('/cart')
    } else {
        res.status(404).json({
            message: 'Product not found in cart'
        });
    }
});

app.post('/cart/decrement/:id', async (req, res) => {
    const productId = req.params.id;
    const findId = await cart.findOne({ "Cart_products._id": productId });
    if (findId) {
        const productQty = findId.Cart_products.find(item => item._id.toString() === productId).Quantity;
        const newProductQty = productQty - 1;
        findId.Cart_products.find(item => item._id.toString() === productId).Quantity = newProductQty;
        await findId.save();
        res.redirect('/cart')
    } else {
        res.status(404).json({
            message: 'Product not found in cart'
        });
    }
});

app.post('/cart/clear/:id', async (req, res) => {
    const userID  = req.params.id;

    const Cart = await cart.findById( userID );

    if (!Cart) {
        return res.status(404).send('Cart not found');
    }

    Cart.Cart_products = [];

    await Cart.save();

    res.redirect('/cart');
});


app.patch('/API/category/:id', upload.single("image"), async(req,res)=> {
    try{
        const Category = await category.findById(req.params.id); 

        Category.name = req.body.name || Category.name; 
        Category.status = req.body.status || Category.status; 

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
        res.send('Error' + err)
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

app.get("/", async (req, res) => {
    const defaultRenderData = getDefaultRenderData(req);
    const currentCurrencyLogo = currencyLogo
    const totalQuantity = req.session.totalQuantity;

    try {
        const Category = await category.find({}).limit(5);
        const newProducts = await product.find({ newProduct: true }).limit(5);
        const flashSale = await product.find({flashSale: true})
        const best_sellers = await product.find({}).limit(10)
        const topRated = await product.find({topRated: true}).limit(6)
        res.render("index", {
            defaultRenderData,
            totalQuantity,
            currentCurrencyLogo: currentCurrencyLogo,            
            newProducts: newProducts,
            Category: Category,
            flashSale: flashSale,
            best_sellers: best_sellers,
            topRated: topRated,
        });
        // console.log(defaultRenderData.user.username)
        // res.json(newProducts)
    } catch (err) {
        res.send("Error " + err);
    }
});

app.get('/category/:slug', async (req, res) => {
    const defaultRenderData = getDefaultRenderData(req);
    // console.log("------------------", req.body.name);
    
    try {
        const slug = req.params.slug;
        const Category = await category.findOne({ slug: slug });
        const categoryId = new ObjectId(Category._id);
        const products = await product.find({ category: categoryId });
        // res.json( products)
        res.render("categoryWiseProducts", {
            defaultRenderData,
            products: products,
            Category: Category,
        });
    } catch (err) {
        res.send('Error ' + err);
    }
});

app.get('/products/:slug', async (req, res) => {
    const defaultRenderData = getDefaultRenderData(req);
    const currentCurrencyLogo = currencyLogo;
    // if (defaultRenderData.user) {
        try {
                const slug = req.params.slug;
                const Product = await product.findOne({slug: slug});
                const Category = await category.find({}).limit(5);
                // const products = await product.find(Product);
                // console.log(Product.title)

                res.render("product", {
                    defaultRenderData,
                    currentCurrencyLogo: currentCurrencyLogo,
                    products: Product,
                    Category: Category,
                });
            } catch (err) {
            res.send("Error " + err);
        }
    // }
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
        Product.title = req.body.title || Product.title; 
        Product.price = req.body.price || Product.price; 
        Product.description = req.body.description || Product.description; 
        Product.newProduct = req.body.newProduct || Product.newProduct 
        Product.flashSale = req.body.flashSale || Product.flashSale 
        Product.topRated= req.body.topRated || Product.topRated 

        if(req.file) { // Check if new image is uploaded
            const { filename } = req.file;
            const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
            Product.image = imageUrl; // Update image
        }
        
        // Product.slug = req.body.slug || Product.slug
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

app.post("/signUp", async (req, res) => {
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

app.post("/send", (req, res) => {
    const verificationToken = generateToken();

    const output = 
        `<p>Thank you for subscribing to our Services </p>`;

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: 'fortestingnodejs@gmail.com',
            pass: 'idrlxprfmuljerqb'
        }
    });

    const user_mail = req.body.email
    console.log(user_mail)

    const mailOptions = {
        from: "fortestingnodejs@gmail.com",
        to: user_mail,
        subject: "Testing",
        text: `<p>Please click on the following link to verify your email: <a href="http://localhost:3000/welcome/${verificationToken}">click Here</a></p>`,
        html: output
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log("Message sent: ", user_mail)

        // res.json('Success')
        res.redirect("/");
    });
});

app.get('/welcome/:token', (req, res) => {
    res.render('verifyMail')
})

app.get('/whats-new', async (req, res) => {
    let defaultRenderData = getDefaultRenderData(req);
    const Category = await category.find({}).limit(5);
    
    try{
        const Product = await product.find({newProduct: true})
        res.render("newProducts", {
            defaultRenderData,
            Product: Product,
            Category: Category
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
    const Category = await category.find({}).limit(5);

    try{
        const Product = await product.find({})
        res.render("best_sellers", {
            defaultRenderData,
            Product: Product,
            Category: Category
        });
        // res.json(Product);
    }catch(err){
        res.send('Error ' + err)
    }
});

app.get('/top-rated', async (req, res) => {
    let defaultRenderData = getDefaultRenderData(req);
    const Category = await category.find({}).limit(5);
    
    try{
        const Product = await product.find({topRated: true})
        res.render("topRated", {
            defaultRenderData,
            Product: Product,
            Category: Category
        });
        // res.json(Product);
    }catch(err){
        res.send('Error '+ err)
    }
})

app.get('/checkout', async (req, res) => {
    let defaultRenderData = getDefaultRenderData(req)
    
    if(!defaultRenderData.user) {
        res.redirect('/')
    }

    try {
        res.render('checkout', {
            defaultRenderData
        })
    } catch(err) {
        res.send('Error' + err)
    }
})

app.post("/logout", (req, res) => { 
    req.session.destroy(function (err) {
        res.redirect("/");
    });
});

app.get("*", (req, res) => {
    let defaultRenderData = getDefaultRenderData(req);
    res.render('error 404', defaultRenderData)
});

app.listen(3000, () => {
    console.log("connected to server");
});