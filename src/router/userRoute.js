const express = require('express');
const router = express.Router();
const session = require("express-session");

const user_data = require('../model/user')
const category = require('../model/CategoryAdd')

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

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

router.post("/login", async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const user = await user_data.findOne({ email: email, password: password});

    try {
        if (user) {
            req.session.user = {
                username: user.username,
                userId: user._id,
            };
            res.status(200).redirect('/');
        } else {
            res.status(401).send({ error: "Invalid email or password" });
        }
    } catch (error) {
        res.send(error.message);
    }
});

router.post("/signUp", async (req, res) => {
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

            // console.log('dataaaaa------111111'+entered_data)
            await entered_data.save()
            // res.json({success: 'qwerty'})
            // console.log('dataaaaa------', entered_data)
            res.redirect('/')
        } else {
            res.send("Passwords do not match");
        }
    } catch (error) {
        res.send(error);
    }
});

router.get('/', async (req, res) => {
    const defaultRenderData = getDefaultRenderData(req);
    const userID = defaultRenderData.user.userId;

    if (!userID) {
      res.redirect("/");
    }

    try {

        const Category = await category.find({}).limit(5);
        const User = await user_data.findById(userID)
        // console.log('userrrrr-------', User)

        res.render("profile", {
            defaultRenderData,
            Category: Category,
            User: User
        });
    } catch (err) {
        res.send(err)
    }
})

router.get('/change-password', async (req, res) => {
    const defaultRenderData = getDefaultRenderData(req);
    // console.log(defaultRenderData.user.userId)

    if(!defaultRenderData.user) {
        res.redirect('/')
    }

    try {

        const Category = await category.find({}).limit(5);

        res.render("changePassword", {
            defaultRenderData,
            Category: Category,
        });
    } catch (err) {
        res.send('Error', err)
    }
})

router.post('/change-password', async (req, res) => {
    const defaultRenderData = getDefaultRenderData(req);

    try {
            const currentPassword = req.body.currentPassword;
            // console.log("body password--------", currentPassword);
            const newPassword = req.body.newPassword;
            const confirmNewPassword = req.body.confirmNewPassword;
            const userId = defaultRenderData.user.userId;

            const currentUserPassword = await user_data.findById(userId);
            // console.log("current password-----------", currentUserPassword);

            if (currentPassword !== currentUserPassword.password) {
                throw new Error(
                "Current password does not match the logged-in user's password"
                );
            }

            if (newPassword === currentUserPassword.password) {
                throw new Error(
                "New password cannot be the same as the current password"
                );
            }

            if (newPassword !== confirmNewPassword) {
                throw new Error("New password and confirm password do not match");
            }

            currentUserPassword.password = newPassword;
            await currentUserPassword.save();

            return res.render("changePassword", {
                defaultRenderData,
                success: "Password updated Successfully",
            });
        } catch (err) {
        return res.status(400).render("changePassword", {
            defaultRenderData,
            error: err.message,
        });
    }
})

module.exports = router