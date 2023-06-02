const express = require("express")
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const hbs = require("hbs")
const path = require("path")
const multer = require('multer')
const slugify = require('slugify')
const nodemailer = require("nodemailer")
const session = require("express-session")
const fuzzy = require('fuzzy');
const stripe = require("stripe")(
    "sk_test_51N1qXSSEaYr7gzBKRVlJdXlZamDiI2W9ErLtMqxF15MSNtNfqFufFmzVdkWW4qKEVMWwdM0KnLnDmJjIsnSvruQZ00alFo2ZKS"
);

const user_data = require("./model/user")
const admin = require('./model/adminSchema')
const cart = require("./model/cart")
const order = require('./model/order')
const wishlist = require('./model/wishlist')
const category = require("../Dynamic API/CategoryAdd")
const product = require('../Dynamic API/productAdd')
const ObjectId = mongoose.Types.ObjectId;

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
    const token = Math.random().toString(36).substring(2, 12)
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
            sameSite: "lax",
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
        }, // Set the cookie to be non-secure to run in local
    })
);

function getDefaultRenderData(req) {
    return {
        user: req.session.user || false
    };
}

const currencyLogo = "₹";

// let storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, "./public/uploads");
//     },
//     filename: (req, file, cb) => {
//         cb(null, file.fieldname + "-" + Date.now() + ".jpg");
//     },
// });

// let upload = multer({ 
//     storage: storage,
//     limits: { fileSize: 5 * 1024 * 1024 } // 5MB
// });

// app.post("/API/category", upload.single("image"), async (req, res) => {
//     try {
//         const { filename } = req.file;
//         // const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
//         const imageUrl = `../uploads/${filename}`;

//         const newCategory = new category({
//             name: req.body.name,
//             status: req.body.status,
//             image: imageUrl,
//             slug: slugify((req.body.name), {
//                 lower: true,
//                 strict: true
//             })
//         });
//         console.log(newCategory)

//         await newCategory.save();

//         res.json({ message: "Category added Successfully" });
//     } catch (err) {
//         console.log(err);
//         res.status(500).send("Error saving category");
//     }
// });

// app.get('/autocomplete', async (req, res) => {
//     const query = req.query.term;
//     try {
//         const products = await product.find({});

//         // Filter products using fuzzy search
//         const results = fuzzy.filter(query, products, {
//             extract: (p) => p.title // Use product titles for the fuzzy search
//         });

//         const suggestions = results.map((search) => ({
//             title: search.original.title,
//             slug: search.original.slug,
//             url: `/${encodeURIComponent(search.original.slug)}`, // URL of search result page for product
//         }));

//         res.send(suggestions);
//     } catch (err) {
//         console.error(err);
//         res.status(500).send('Server Error');
//     }
// });

// -----------cart CRUD operations code----------

// app.get('/cart', async (req, res) => {
//     let defaultRenderData = getDefaultRenderData(req);

//     const userId = defaultRenderData.user.userId;
//     // console.log('user---------'+ userId)
//     if(!userId) {
//         res.redirect('/')
//     }

//     try {
//         const Category = await category.find({})
//         const Cart = await cart.findOne({User: userId }).lean().populate({
//             path: "Cart_products.Product",
//             model: "product",
//         });
//         // const Cart = await cart.findOne({User: userId})
//         // console.log('cartttttttttttt---  ' + JSON.stringify( Cart));
//         res.render('cart', {
//             defaultRenderData,
//             Cart: Cart,
//             Category: Category
//         });
//     } catch (err) {
//         // console.error(err);
//         res.send(err);
//     }
// });

// app.get('/checkout', async (req, res) => {
//     let defaultRenderData = getDefaultRenderData(req);

//     const userId = defaultRenderData.user.userId;
//     console.log('user---------'+ userId)
//     if(!userId) {
//         res.redirect('/')
//     }

//     try {
//         const Category = await category.find({})
//         const Cart = await cart.findOne({User: userId }).lean().populate({
//             path: "Cart_products.Product",
//             model: "product",
//         });
//         // const Cart = await cart.findOne({User: userId})
//         // console.log('cartttttttttttt---  ' + JSON.stringify( Cart));
//         res.render('checkout', {
//             defaultRenderData,
//             Cart: Cart,
//             Category: Category
//         });
//     } catch (err) {
//         // console.error(err);
//         res.send(err);
//     }
// });

// app.post('/add-to-cart', async (req, res) => {
//     const defaultRenderData = getDefaultRenderData(req);

//     try {
//         const userId = defaultRenderData.user.userId;

//         let Cart = await cart.findOne({ User: userId });
//         // console.log('sdsdasdsadsad'+ Cart)

//         if (!Cart) {
//             const newCart = new cart({
//                 User: userId,
//                 Cart_products: [
//                     {
//                         User_cart_id: userId,
//                         Product: req.body.productId,
//                         Quantity: req.body.quantity,
//                         Created_at: Date.now(),
//                     },
//                 ],
//             });

//             await newCart.save();
//             console.log(newCart);
//         } else {
//             const cartProductIndex = Cart.Cart_products.findIndex((item) =>
//                 item.Product.equals(req.body.productId)
//             );

//             if (cartProductIndex >= 0) {
//                 // Update quantity for existing cart product
//                 const cartProduct = Cart.Cart_products[cartProductIndex];
//                 cartProduct.Quantity = req.body.quantity;
//                 cartProduct.Updated_at = Date.now();

//                 // Remove cart product if new quantity is 0
//                 if (req.body.quantity === 0) {
//                     Cart.Cart_products.splice(cartProductIndex, 1);
//                 }
//             } else {
//                 // Add new cart product
//                 Cart.Cart_products.push({
//                     User_cart_id: userId,
//                     Product: req.body.productId,
//                     Quantity: req.body.quantity,
//                     Created_at: Date.now(),
//                     Updated_at: Date.now()
//                 });
//             }

//             await Cart.save();
//             // console.log(Cart);
//         }
        
//         // res.send({ Success: 'Product added to cart successfully'});
//         res.redirect('/cart');
//     } catch (err) {
//         console.log('error'+ err);
//         res.status(500).send('Error adding product to cart');
//     }
// });

// app.post('/cart/remove/:id', async(req, res) => {
//     const rowID = req.params.id
//     const product = await cart.findOne({ 'Cart_products._id': rowID })
//     // console.log('product-------------------',product)

//     if (!product) {
//         return res.status(404).send('Product not found in cart')
//     }

//     // remove the product from the Cart_products array
//     product.Cart_products = product.Cart_products.filter(item => item._id.toString() !== rowID)

//     await product.save()

//     res.redirect('/cart')
// })

// app.post('/cart/increment/:id', async (req, res) => {
//     const productId = req.params.id;
//     const findId = await cart.findOne({ "Cart_products._id": productId });
//     if (findId) {
//         const productQty = findId.Cart_products.find(item => item._id.toString() === productId).Quantity;
//         const newProductQty = productQty + 1;
//         findId.Cart_products.find(item => item._id.toString() === productId).Quantity = newProductQty;
//         await findId.save();
//         res.redirect('/cart')
//     } else {
//         res.status(404).json({
//             message: 'Product not found in cart'
//         });
//     }
// });

// app.post('/cart/decrement/:id', async (req, res) => {
//     const productId = req.params.id;
//     const findId = await cart.findOne({ "Cart_products._id": productId });
//     if (findId) {
//         const productQty = findId.Cart_products.find(item => item._id.toString() === productId).Quantity;
//         const newProductQty = productQty - 1;
//         findId.Cart_products.find(item => item._id.toString() === productId).Quantity = newProductQty;
//         await findId.save();
//         res.redirect('/cart')
//     } else {
//         res.status(404).json({
//             message: 'Product not found in cart'
//         });
//     }
// });

// app.post('/cart/clear/:id', async (req, res) => {
//     const userID  = req.params.id;

//     const Cart = await cart.findById( userID );

//     if (!Cart) {
//         return res.status(404).send('Cart not found');
//     }

//     Cart.Cart_products = [];

//     await Cart.save();

//     res.redirect('/cart');
// });

// app.post('/create-checkout-session', async (req, res) => {
//     const defaultRenderData = getDefaultRenderData(req);
//     const orderID = generateToken();

//     const userID = defaultRenderData.user.userId;

//     try {
//         const Cart = await cart.findOne({ User: userID }).lean().populate({
//             path: "Cart_products.Product",
//             model: "product",
//         });

//         const lineItems = Cart.Cart_products.map((Cart_products) => {
//             return {
//                 price_data: {
//                     currency: 'inr',
//                     product_data: {
//                         name: Cart_products.Product.title,
//                     },
//                     unit_amount: Cart_products.Product.price * 100,
//                 },
//                 quantity: Cart_products.Quantity,
//             };
//         });

//         const session = await stripe.checkout.sessions.create({
//             payment_method_types: ['card'],
//             line_items: lineItems,
//             mode: 'payment',
//             success_url: 'http://localhost:3000/thanks',
//             cancel_url: 'http://localhost:3000/cancel',
//         });

//         const sessionDetails = await stripe.checkout.sessions.retrieve(session.id);
//         console.log('sessionn------', sessionDetails.payment_status);

//         const order_data = new order({
//             User: defaultRenderData.user.userId,
//             Order_Id: orderID,
//             Total_items: req.body.Quantity.length,
//             Total_amount: req.body.totalAmount,
//             order: [
//                 {
//                     Product: req.body.product_id,
//                     Quantity: req.body.Quantity,
//                     itemName: req.body.itemName,
//                     subTotal: req.body.subTotal,
//                     Address: [
//                         {
//                             Name: req.body.firstName + ' ' + req.body.lastName,
//                             contact_no: req.body.contactNumber,
//                             house_no: req.body.houseNo,
//                             Area: req.body.area,
//                             city: req.body.city,
//                             state: req.body.state,
//                             pincode: req.body.pincode,
//                         },
//                     ],
//                 },
//             ],
//         });

//         // console.log('ooo-----', order_data);

//         await order_data.save();
//         await cart.findOneAndDelete(userID);

//         res.redirect(303, session.url);
//     } catch (error) {
//         console.log(error);
//         res.status(500).send('Something went wrong.');
//     }
// });


// app.get('/orders', async (req, res) => {
//     const defaultRenderData = getDefaultRenderData(req);

//     const userID = defaultRenderData.user.userId;
//     if (!userID) {
//         res.redirect('/');
//     }

//     try {
//         const orders = await order.find({ User: userID }).sort({ordered_on: -1});

//         if (!orders) {
//             throw new Error('User orders not found');
//         }

//         res.render('orders', {
//             defaultRenderData,
//             orders,
//         });
//     } catch (err) {
//         console.error(err);
//     }
// });

// app.get('/orders/:Order_Id', async (req, res) => {
//     const defaultRenderData = getDefaultRenderData(req);

//     const userID = defaultRenderData.user.userId;

//     const orderID = req.params.Order_Id
//     if (!userID) {
//         res.redirect('/');
//     }

//     try {

//         const Order = await order.find({ Order_Id: orderID }).lean().populate({
//             path: "order.Product",
//             model: "product",
//         })


//         // console.log('orderrrrrr---------', Order)
//         res.render('orderDetail', {
//             defaultRenderData,
//             Order: Order
//         })
//     } catch(err) {
//         console.log(err)
//     }
// })

// app.patch('/API/category/:id', upload.single("image"), async(req,res)=> {
//     try{
//         const Category = await category.findById(req.params.id); 

//         Category.name = req.body.name || Category.name; 
//         Category.status = req.body.status || Category.status; 

//         if(req.file) { // Check if new image is uploaded
//             const { filename } = req.file;
//             const imageUrl = `../uploads/${filename}`;
//             Category.image = imageUrl; // Update image
//         }
//         const updatedSlug = slugify(Category.name, {
//             lower: true,
//             strict: true
//         });
//         Category.slug = updatedSlug;

//         const data = await Category.save();
//         res.json(data);   
//     }catch(err){
//         res.send('Error' + err)
//     }
// })

// app.get("/", async (req, res) => {
//     const defaultRenderData = getDefaultRenderData(req);
//     const currentCurrencyLogo = currencyLogo
//     const totalQuantity = req.session.totalQuantity;

//     try {
//         const Category = await category.find({ active: true }).limit(5);
//         const newProducts = await product.find({ newProduct: true, active: true }).limit(5);
//         const flashSale = await product.find({ flashSale: true, active: true }).limit(6);
//         const best_sellers = await product.find({ active: true }).limit(10);
//         const topRated = await product.find({topRated: true, active: true}).limit(6)
//         res.render("index", {
//             defaultRenderData,
//             totalQuantity,
//             currentCurrencyLogo: currentCurrencyLogo,            
//             newProducts: newProducts,
//             Category: Category,
//             flashSale: flashSale,
//             best_sellers: best_sellers,
//             topRated: topRated,
//         });
//         // console.log(defaultRenderData.user.username)
//         // res.json(newProducts)
//     } catch (err) {
//         res.send("Error " + err);
//     }
// });

// app.get('/category/:slug', async (req, res) => {
//     const defaultRenderData = getDefaultRenderData(req);
//     // console.log("------------------", req.body.name);
    
//     try {
//         const slug = req.params.slug;
//         const Category = await category.findOne({ slug: slug, active: true });
//         const categoryId = new ObjectId(Category._id);
//         const products = await product.find({ category: categoryId, active: true });
//         // res.json( products)
//         res.render("categoryWiseProducts", {
//             defaultRenderData,
//             products: products,
//             Category: Category,
//         });
//     } catch (err) {
//         res.send('Error ' + err);
//     }
// });

// app.get("/products/:slug", async (req, res) => {
//     const defaultRenderData = getDefaultRenderData(req);

//     try {
//         const slug = req.params.slug;
//         const Product = await product.findOne({ slug: slug, active: true });
//         const Category = await category.find({ active: true }).limit(5);

//         const userId = defaultRenderData.user.userId;
//         let isProductInWishlist = false;

//         if (userId) {
//             const Wishlist = await wishlist.findOne({ User: userId });
//             if (Wishlist) {
//                 isProductInWishlist = Wishlist.Wishlist.some((item) =>
//                     item.Product && item.Product.toString() === Product._id.toString()
//                 );
//             }
//         }

//         res.render("product", {
//             defaultRenderData,
//             products: Product,
//             Category: Category,
//             isProductInWishlist: isProductInWishlist,
//         });
//     } catch (err) {
//         res.send("Error " + err);
//     }
// });

// app.post("/API/products", upload.single("image"), async (req, res) => {
//     try {
//         const { filename } = req.file;
//         const imageUrl = `../uploads/${filename}`;

//         const newProduct = new product({
//             category: req.body.category,
//             title: req.body.title,
//             price: req.body.price,
//             image: imageUrl,
//             description: req.body.description,
//             newProduct: req.body.newProduct,
//             flashSale: req.body.flashSale,
//             topRated: req.body.topRated,
//             slug: slugify((req.body.title), {
//                 lower: true,
//                 strict: true
//             })
//         });
//         console.log(newProduct)

//         await newProduct.save();

//         res.json({ message: "Product added Successfully" });
//     } catch (err) {
//         console.log(err);
//         res.status(500).send("Error saving Product");
//     }
// });

// app.patch('/API/products/:id', upload.single("image"), async(req,res)=> {
//     try{
//         const Product = await product.findById(req.params.id); 

//         Product.category = req.body.category || Product.category; // Update category
//         Product.title = req.body.title || Product.title; 
//         Product.price = req.body.price || Product.price; 
//         Product.description = req.body.description || Product.description; 
//         Product.newProduct = req.body.newProduct || Product.newProduct 
//         Product.flashSale = req.body.flashSale || Product.flashSale 
//         Product.topRated= req.body.topRated || Product.topRated 

//         if(req.file) { // Check if new image is uploaded
//             const { filename } = req.file;
//             const imageUrl = `../uploads/${filename}`;
//             Product.image = imageUrl; // Update image
//         }
        
//         // Product.slug = req.body.slug || Product.slug
//         const updatedSlug = slugify(Product.title, {
//             lower: true,
//             strict: true
//         });
//         Product.slug = updatedSlug;

//         const data = await Product.save();
//         res.json(data);   
//     }catch(err){
//         res.status(500).send(err.message);
//     }
// })

// app.post("/login", async (req, res) => {
//     const email = req.body.email;
//     const password = req.body.password;
//     const user = await user_data.findOne({ email: email, password: password});

//     try {
//         if (user) {
//             req.session.user = {
//                 username: user.username,
//                 userId: user._id,
//             };
//             res.status(200).redirect('/');
//         } else {
//             res.status(401).send({ error: "Invalid email or password" });
//         }
//     } catch (error) {
//         res.send(error.message);
//     }
// });

// app.post("/signUp", async (req, res) => {
//     const password = req.body.password;
//     const confirm_pass = req.body.confirm_pass;

//     try {
//         if (password === confirm_pass) {
//             const existingEmail = await user_data.findOne({
//                 email: req.body.email,
//             });

//             if (existingEmail) {
//                 return res.send("Email already exists!");
//             }

//             const entered_data = new user_data({
//                 username: req.body.username,
//                 email: req.body.email,
//                 password: req.body.password,
//                 confirm_pass: req.body.confirm_pass,
//             });

//             // console.log('dataaaaa------111111'+entered_data)
//             await entered_data.save()
//             // res.json({success: 'qwerty'})
//             console.log('dataaaaa------', entered_data)
//             res.redirect('/')
//         } else {
//             res.send("Passwords do not match");
//         }
//     } catch (error) {
//         res.send(error);
//     }
// });

// app.get('/profile', async (req, res) => {
//     const defaultRenderData = getDefaultRenderData(req);
//     const userID = defaultRenderData.user.userId;

//     if (!userID) {
//       res.redirect("/");
//     }

//     try {

//         const Category = await category.find({}).limit(5);
//         const User = await user_data.findById(userID)
//         // console.log('userrrrr-------', User)

//         res.render("profile", {
//             defaultRenderData,
//             Category: Category,
//             User: User
//         });
//     } catch (err) {
//         res.send(err)
//     }
// })

// app.get('/change-password', async (req, res) => {
//     const defaultRenderData = getDefaultRenderData(req);
//     // console.log(defaultRenderData.user.userId)

//     if(!defaultRenderData.user) {
//         res.redirect('/')
//     }

//     try {

//         const Category = await category.find({}).limit(5);

//         res.render("changePassword", {
//             defaultRenderData,
//             Category: Category,
//         });
//     } catch (err) {
//         res.send('Error', err)
//     }
// })

// app.post('/change-password', async (req, res) => {
//     const defaultRenderData = getDefaultRenderData(req);

//     try {
//         const currnetPassword = req.body.currnet_password;
//         const newPassword = req.body.new_password;
//         const confirmNewPassword = req.body.confirm_new_password;
//         const userId = defaultRenderData.user.userId;

//         const currentUserPassword = await user_data.findById(userId);

//         if (currnetPassword !== currentUserPassword.password) {
//             throw new Error( "Current passeord does not match the logged-in user's password")
//         }

//         if (newPassword === currentUserPassword.password) {
//             throw new Error("New password cannot be the same as the current password")
//         }

//         if (newPassword !== confirmNewPassword) {
//             throw new Error("New password and confirm password dosen't match")
//         }

//         currentUserPassword.password = newPassword;
//         await currentUserPassword.save()

//         return res.render("profile", {
//             defaultRenderData,
//             success: 'Password updated Successfully'
//         });
//     } catch (err) {
//         return res.status(400).render("profile", {
//             defaultRenderData,
//             error: err.message,
//         });
//     }
// })

// app.post("/send", (req, res) => {
//     const verificationToken = generateToken();
//     console.log('tokennn-----',verificationToken)

//     const output = `<p>Thank you for subscribing to our Services </p>`;

//     // create reusable transporter object using the default SMTP transport
//     let transporter = nodemailer.createTransport({
//         service: "gmail",
//         auth: {
//             user: 'fortestingnodejs@gmail.com',
//             pass: 'idrlxprfmuljerqb'
//         }
//     });

//     const user_mail = req.body.email
//     console.log(user_mail)

//     const mailOptions = {
//         from: "fortestingnodejs@gmail.com",
//         to: user_mail,
//         subject: "Testing",
//         text: `<p>Thank you for subscribing to our Services </p>`,
//         html: output
//     };

//     // send mail with defined transport object
//     transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
//             return console.log(error);
//         }
//         console.log("Message sent: ", user_mail)

//         // res.json('Success')
//         res.redirect("/");
//     });
// });

// app.get('/welcome/:token', (req, res) => {
//     res.render('verifyMail')
// })

// app.get('/whats-new', async (req, res) => {
//     let defaultRenderData = getDefaultRenderData(req);
//     const Category = await category.find({}).limit(5);
    
//     try{
//         const Product = await product.find({ newProduct: true, active: true });
//         res.render("newProducts", {
//             defaultRenderData,
//             Product: Product,
//             Category: Category
//         });
//         // res.json(Product);
//     }catch(err){
//         res.send('Error ' + err)
//     }
// })

// app.get('/categories', async (req, res) => {
//     const defaultRenderData = getDefaultRenderData(req);
    
//     try {
//         const Category = await category.find({ active: true });
        
//         // res.json(Category)
//         res.render("allCategories", {
//             defaultRenderData,
//             Category: Category,
//         });
//     } catch (err) {
//         res.send('Error ' + err);
//     }
// });

// app.get("/best-sellers", async (req, res) => {

//     let defaultRenderData = getDefaultRenderData(req);
//     const Category = await category.find({ active: true }).limit(5);

//     try{
//         const Product = await product.find({active: true})
//         res.render("best_sellers", {
//             defaultRenderData,
//             Product: Product,
//             Category: Category
//         });
//         // res.json(Product);
//     }catch(err){
//         res.send('Error ' + err)
//     }
// });

// app.get('/top-rated', async (req, res) => {
//     let defaultRenderData = getDefaultRenderData(req);
//     const Category = await category.find({}).limit(5);
    
//     try{
//         const Product = await product.find({ topRated: true, active: true });
//         res.render("topRated", {
//             defaultRenderData,
//             Product: Product,
//             Category: Category
//         });
//         // res.json(Product);
//     }catch(err){
//         res.send('Error '+ err)
//     }
// })

// app.get('/address', async(req, res) => {
//     let defaultRenderData = getDefaultRenderData(req);

//     const userId = defaultRenderData.user.userId;

//     if (!userId) {
//         res.redirect('/');
//     }

//     try {

//         const Address = await order.find({'User' :userId})
//         const Category = await category.find({}).limit(5);

//         // console.log('add--------', Address[0].order[0].Address)

//         res.render("address", {
//             defaultRenderData,
//             Address: Address,
//             Category: Category,
//         });
//     } catch (err) {
//         res.send(err)
//     }
// })

// app.patch('/address/update/:id', async (req, res) => {
//     try {
//         const addressId = req.params.id;
//         const address = await order.findOne({'order.Address._id': addressId});

//         if (!address) {
//             return res.status(404).send("Address not found");
//         }

//         const updatedOrder = address.order.map(orderItem => {
//             const updatedAddress = orderItem.Address.find(addr => addr._id.toString() === addressId);

//             if (updatedAddress) {
//                 updatedAddress.Name = req.body.firstName + req.body.lastName || updatedAddress.Name;
//                 updatedAddress.contact_no = req.body.contactNumber || updatedAddress.contact_no;
//                 updatedAddress.house_no = req.body.houseNo || updatedAddress.house_no;
//                 updatedAddress.Area = req.body.area || updatedAddress.Area;
//                 updatedAddress.city = req.body.city || updatedAddress.city;
//                 updatedAddress.state = req.body.state || updatedAddress.state;
//                 updatedAddress.pincode = req.body.pincode || updatedAddress.pincode;
//             }

//             return orderItem;
//         });

//         address.order = updatedOrder;
//         await address.save();

//         res.status(200).json({ message: "Address updated successfully" });
//     } catch (err) {
//         res.status(500).json({ error: "Error updating address" });
//     }
// });

// app.get('/thanks', async (req, res) => {
//     let defaultRenderData = getDefaultRenderData(req);

//     const userId = defaultRenderData.user.userId;

//     if (!userId) {
//         res.redirect('/');
//     }

//     try {
//         const Category = await category.find({}).limit(5);

//         res.render('thanks', {
//             defaultRenderData,
//             Category: Category,
//         })
//     } catch (err) {
//         res.send('Error' + err)
//     }
// })

// app.get('/cancel', async (req, res) => {
//     let defaultRenderData = getDefaultRenderData(req);

//     const userId = defaultRenderData.user.userId;

//     if (!userId) {
//         res.redirect('/');
//     }

//     try {

//         const Category = await category.find({}).limit(5);

//         res.render('cancel', {
//             defaultRenderData,
//             Category: Category,
//         })
//     } catch (err) {
//         res.send('Error' + err)
//     }
// })

// app.post("/wishlist/toggle/:id", async (req, res) => {
//     const defaultRenderData = getDefaultRenderData(req);

//     try {
//         const userId = defaultRenderData.user.userId;

//         if (!userId) {
//             res.redirect("/");
//             return;
//         }

//         const productId = req.params.id;

//         let Wishlist = await wishlist.findOne({ User: userId });

//         if (!Wishlist) {
//             Wishlist = new wishlist({ User: userId, Wishlist: [] });
//         }

//         const productExistsIndex = Wishlist.Wishlist.findIndex((item) =>
//             item.Product?.equals?.(productId)
//         );

//         if (productExistsIndex !== -1) {
//             // Product already exists in the wishlist, remove it
//             Wishlist.Wishlist.splice(productExistsIndex, 1);
//         } else {
//             // Product doesn't exist in the wishlist, add it
//             Wishlist.Wishlist.push({ Product: productId });
//         }

//         await Wishlist.save();

//         // Return the updated wishlist status
//         res.json({ isInWishlist: productExistsIndex === -1 });
//     } catch (error) {
//         console.error("Error adding/removing product to/from wishlist:", error);
//         // Send an error response
//         res.status(500).send("An error occurred");
//     }
// });

// app.post('/wishlist/remove/:id', async (req, res) => {
//     const rowID = req.params.id;
//     try {
//         const wishlistItem = await wishlist.findOne({ 'Wishlist._id': rowID });
//         // console.log('wishlistItem-------------------', wishlistItem);
        
//         if (!wishlistItem) {
//             return res.status(404).send('Product not found in wishlist');
//         }
        
//         // Remove the product from the Wishlist array
//         wishlistItem.Wishlist = wishlistItem.Wishlist.filter(item => item._id.toString() !== rowID);
        
//         await wishlistItem.save();
        
//         res.redirect('/wishlist');
//     } catch (err) {
//         console.error(err);
//         res.status(500).send('Internal Server Error');
//     }
// });


// app.get('/wishlist', async (req, res) => {
//     let defaultRenderData = getDefaultRenderData(req);

//     const userId = defaultRenderData.user.userId;

//     if (!userId) {
//         res.redirect('/');
//     }

//     try {
//         const Wishlist = await wishlist.find({ User: userId }).lean().populate({
//             path: "Wishlist.Product",
//             model: "product",
//         });
//         const Category = await category.find({}).limit(5);

//         // console.log('wishlistttt-------', Wishlist[0].Wishlist)

//         res.render("wishlist", {
//             defaultRenderData,
//             Wishlist: Wishlist,
//             Category: Category,
//         });
//     } catch (err) {
//         res.send('Error' + err);
//     }
// });

// ------------------------------- Admin Panel --------------------------------

// app.get('/admin', (req, res) => {
//     res.render('admin')
// })

// app.post("/adminLogin", async (req, res) => {
//     const email = req.body.email;
//     // console.log("mailllllllll", email);

//     const password = req.body.password;
//     // console.log("passssssss", password);

//     const user = await admin.findOne({email: email, password: password});
//     // console.log('userrrrrr-------admin', user);

//     try {
//         if (user) {
//             req.session.user = {
//                 username: user.username,
//                 userId: user._id,
//             };
//             res.status(200).redirect('/dashboard');
//         } else {
//             res.status(401).send({ error: "Invalid email or password" });
//         }
//     } catch (error) {
//         res.send(error.message);
//     }
// });


// app.get('/dashboard', (req, res) => {
//     let defaultRenderData = getDefaultRenderData(req);

//     const userId = defaultRenderData.user.userId;

//     // if(!userId) {
//     //     res.redirect('admin')
//     // }

//     // res.send('dashboard')
//     try {
//         res.render('dashboard', {
//             defaultRenderData
//         })
//     } catch (err) {
//         res.send(err)
//     }
// })

// app.get('/product-add', async (req, res) => {
//     // res.send('productAdd')

//     let defaultRenderData = getDefaultRenderData(req);

//     const userId = defaultRenderData.user.userId;

//     // if(!userId) {
//     //     res.redirect('/admin')
//     // }

//     try {

//         const Category = await category.find({})
//         res.render('productAdd', {
//             defaultRenderData,
//             Category: Category
//         })
//     } catch (err) {
//         res.send(err)
//     }
// })

// app.get('/product-view', async (req, res) => {
//     // res.send('productView')

//     let defaultRenderData = getDefaultRenderData(req);

//     const userId = defaultRenderData.user.userId;

//     // if(!userId) {
//     //     res.redirect('admin')
//     // }

//     try {
//         const Products = await product.find()
//         const Category = await category.find()
//         res.render('productView', {
//             defaultRenderData,
//             Products: Products,
//             Category: Category
//         })
//     } catch (err) {
//         res.send(err)
//     }
// })

// app.post('/product/remove/:id', async (req, res) => {
//     const rowID = req.params.id;
//     try {
//         const Product = await product.findOneAndDelete({_id :rowID});
//         console.log('wishlistItem------------------- removed------------', Product);
        
//         res.redirect('/product-view');
//     } catch (err) {
//         console.error(err);
//         res.status(500).send('Internal Server Error');
//     }
// });

app.get('/category-add', (req, res) => {
    // res.send('categoryAdd')
    let defaultRenderData = getDefaultRenderData(req);

    const userId = defaultRenderData.user.userId;

    // if(!userId) {
    //     res.redirect('admin')
    // }

    try {
        res.render('categoryAdd', {
            defaultRenderData
        })
    } catch (err) {
        res.send(err)
    }
})

app.get('/category-view', async (req, res) => {
    // res.send('categoryView')
    let defaultRenderData = getDefaultRenderData(req);

    const userId = defaultRenderData.user.userId;

    // if(!userId) {
    //     res.redirect('admin')
    // }

    try {
        const Category = await category.find({})

        const categoryData = await Promise.all(Category.map(async (category) => {
            const totalProducts = await product.countDocuments({ category });
            return { ...category.toObject(), totalProducts };
        }));

        // console.log('count-----------', categoryData)

        res.render('categoryView', {
            defaultRenderData,
            categoryData: categoryData,
        })
    } catch (err) {
        res.send(err,'error')
    }
})

// app.post('/category/remove/:id', async (req, res) => {
//     const rowID = req.params.id;
//     try {
//         const Category = await category.findOneAndDelete({_id :rowID});
//         console.log('cateeeeeeeee------------------- removed------------', Category);

//         await product.deleteMany({ category: rowID });
        
//         res.redirect('/category-view');
//     } catch (err) {
//         console.error(err);
//         res.status(500).send('Internal Server Error');
//     }
// });

// app.put("/api/categories/:categoryId", async (req, res) => {
//     const { categoryId } = req.params;
//     const { active } = req.body;

//     try {
//         // Update the category's active status
//         const Category = await category.findByIdAndUpdate(
//             categoryId,
//             { active: active },
//             { new: true }
//         );

//         // Update the associated products' active status based on the category's active status
//         await product.updateMany(
//             { category: categoryId },
//             { active: active },
//             { multi: true }
//         );

//         // If the category is inactive, also hide the associated products
//         if (!active) {
//             await product.updateMany(
//                 { category: categoryId },
//                 { $set: { visible: false } },
//                 { multi: true }
//             );
//         }

//         res.json(Category);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: "Internal server error" });
//     }
// });



// ----------------------------------------------------------------------------


app.post("/admin/logout", (req, res) => { 
    req.session.destroy(function (err) {
        res.redirect("/admin");
    });
});

app.post("/logout", (req, res) => { 
    req.session.destroy(function (err) {
        res.redirect("/");
    });
});

app.get("*", async (req, res) => {
    let defaultRenderData = getDefaultRenderData(req);
    try  {
        const Category = await category.find({}).limit(5);

        res.render('error 404', {
            defaultRenderData,
            Category: Category
        })
    } catch (err) {
        res.send('Error' + err);
    }
});

app.listen(3000, () => {
    console.log("connected to server");
});