const express = require("express");
const dotenv = require('dotenv')
dotenv.config()
const bodyParser = require("body-parser");
const path = require("path");
const hbs = require('hbs')
const port = process.env.PORT || 3000

const app = express();
require('./src/db/db')
const breadcrumbMiddleware = require('./src/middleware/breadcrumbsMiddleware')

//paths for express config
const publicDirectory = path.join(__dirname, "../fruits-and-vagetables/public");
const viewsPath = path.join(__dirname, "../fruits-and-vagetables/templates/views");
const partialsPath = path.join(__dirname, "../fruits-and-vagetables/templates/partials");

// Setup handlebars engine and views location
app.set("view engine", "ejs");
app.set("views", viewsPath);
hbs.registerPartials(partialsPath);

//Body-parser middle were
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

// Setup static dictionary to serve
app.use(express.static(publicDirectory));

// Breadcrumbs...
app.use(breadcrumbMiddleware)

//
hbs.registerHelper("multiply", function (a, b) {
    return a * b;
});

const HomeRoute = require('./src/router/homeRoute')
const UserRoute = require('./src/router/userRoute')
const AutocompleteRoute = require('./src/router/autocompleteRoute')
const APIRoute = require('./src/router/APIroute')
const CartRoute = require('./src/router/cartRoute')
const OrderRoute = require('./src/router/orderRoute')
const wishlistRoute = require('./src/router/wishlistRoute')
const AdminRoute = require('./src/router/adminRoute')
const AddressRoute = require('./src/router/addressRoute')
const NodeMailerRoute = require('./src/router/nodeMailerRoute')
const ErrorRoute = require('./src/router/errorRoute')

app.use('/', HomeRoute)
app.use('/user', UserRoute)
app.use('/autocomplete', AutocompleteRoute)
app.use('/API', APIRoute)
app.use('/cart', CartRoute)
app.use('/orders', OrderRoute)
app.use('/wishlist', wishlistRoute)
app.use('/admin', AdminRoute)
app.use('/address', AddressRoute)
app.use('/mail', NodeMailerRoute)
app.use('/', ErrorRoute)

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
