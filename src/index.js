require("dotenv").config();
const express = require("express");
const hbs = require("hbs");
const path = require("path");
const session = require("express-session");
const user_data = require("./model/user");
const cartRoutes = require("../routes/cart");


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

// app.use(session({ secret: "Shh, its a secret!" }));

app.use(
    session({
        secret: "mysecretkey", // Replace with a secret key of your own
        resave: false,
        saveUninitialized: true,
        cookie: { 
            secure: false,
            sameSite: 'none',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
        }, // Set the cookie to be non-secure for development purposes
    })
);

app.use("/", cartRoutes);

function getDefaultRenderData(req) {
    return {
        user: req.session.user || false
    };
}

app.get('/', (req,res) => {
    let defaultRenderData = getDefaultRenderData(req);
    res.render("index", defaultRenderData);
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

app.get('/cart', (req, res) => {
    let defaultRenderData = getDefaultRenderData(req);
    res.render('cart', defaultRenderData)
})

app.get("/best_sellers", (req, res) => {

    let defaultRenderData = getDefaultRenderData(req);
    res.render("best_sellers", defaultRenderData);

});

app.get("/test", (req, res) => {
    res.render("test");
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