const express = require('express');
const router = express.Router();
const dotenv = require('dotenv')
dotenv.config()
const session = require("express-session")
const stripe = require("stripe")(process.env.STRIPE_API_KEY);

const category = require('../model/CategoryAdd');
const cart = require('../model/cart')
const order = require('../model/order')

// Generate a random token
function generateToken() {
    const token = Math.random().toString(36).substring(2, 12)
    return token;
}

router.use(
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

router.get('/', async (req, res) => {
    let defaultRenderData = getDefaultRenderData(req);

    const userId = defaultRenderData.user.userId;
    // console.log('user---------'+ userId)
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

router.post('/add-to-cart', async (req, res) => {
    const defaultRenderData = getDefaultRenderData(req);

    try {
        const userId = defaultRenderData.user.userId;

        let Cart = await cart.findOne({ User: userId });
        // console.log('sdsdasdsadsad'+ Cart)

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
            // console.log(newCart);
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
            // console.log(Cart);
        }
        
        // res.send({ Success: 'Product added to cart successfully'});
        res.redirect('/cart');
    } catch (err) {
        console.log('error'+ err);
        res.status(500).send('Error adding product to cart');
    }
});

router.post('/remove/:id', async(req, res) => {
    const rowID = req.params.id
    const product = await cart.findOne({ 'Cart_products._id': rowID })
    // console.log('product-------------------',product)

    if (!product) {
        return res.status(404).send('Product not found in cart')
    }

    // remove the product from the Cart_products array
    product.Cart_products = product.Cart_products.filter(item => item._id.toString() !== rowID)

    await product.save()

    res.redirect('/cart')
})

router.post('/increment/:id', async (req, res) => {
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

router.post('/decrement/:id', async (req, res) => {
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

router.post('/clear/:id', async (req, res) => {
    const userID  = req.params.id;

    const Cart = await cart.findById( userID );

    if (!Cart) {
        return res.status(404).send('Cart not found');
    }

    Cart.Cart_products = [];

    await Cart.save();

    res.redirect('/cart');
});

router.get('/checkout', async (req, res) => {
    let defaultRenderData = getDefaultRenderData(req);

    const userId = defaultRenderData.user.userId;
    // console.log('user---------'+ userId)
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
        res.render('checkout', {
            defaultRenderData,
            Cart: Cart,
            Category: Category
        });
    } catch (err) {
        // console.error(err);
        res.send(err);
    }
});

router.post('/create-checkout-session', async (req, res) => {
    const defaultRenderData = getDefaultRenderData(req);
    const orderID = generateToken();

    const userID = defaultRenderData.user.userId;

    try {
        const Cart = await cart.findOne({ User: userID }).lean().populate({
            path: "Cart_products.Product",
            model: "product",
        });

        const lineItems = Cart.Cart_products.map((Cart_products) => {
            return {
                price_data: {
                    currency: 'inr',
                    product_data: {
                        name: Cart_products.Product.title,
                    },
                    unit_amount: Cart_products.Product.price * 100,
                },
                quantity: Cart_products.Quantity,
            };
        });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: 'http://localhost:3000/thanks',
            cancel_url: 'http://localhost:3000/cancel',
        });

        // const sessionDetails = await stripe.checkout.sessions.retrieve(session.id);
        // console.log('sessionn------', sessionDetails.payment_status);

        const order_data = new order({
            User: defaultRenderData.user.userId,
            Order_Id: orderID,
            Total_items: req.body.Quantity.length,
            Total_amount: req.body.totalAmount,
            order: [
                {
                    Product: req.body.product_id,
                    Quantity: req.body.Quantity,
                    itemName: req.body.itemName,
                    subTotal: req.body.subTotal,
                    Address: [
                        {
                            Name: req.body.firstName + ' ' + req.body.lastName,
                            contact_no: req.body.contactNumber,
                            house_no: req.body.houseNo,
                            Area: req.body.area,
                            city: req.body.city,
                            state: req.body.state,
                            pincode: req.body.pincode,
                        },
                    ],
                },
            ],
        });

        // console.log('ooo-----', order_data);

        await order_data.save();
        // await cart.findOneAndDelete({userID});
        await cart.findOneAndDelete({ User: defaultRenderData.user.userId });

        res.redirect(303, session.url);
    } catch (error) {
        console.log(error);
        res.status(500).send('Something went wrong.');
    }
});

module.exports = router