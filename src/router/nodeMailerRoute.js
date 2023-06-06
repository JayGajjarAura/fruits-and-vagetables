const express = require("express");
const router = express.Router();
const session = require("express-session");
const nodemailer = require("nodemailer");

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

function generateToken() {
    const token = Math.random().toString(36).substring(2, 12)
    return token;
}

router.post("/", (req, res) => {
    const verificationToken = generateToken();
    // console.log('tokennn-----',verificationToken)

    const output = `<p>Thank you for subscribing to our Services </p>`;

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: 'fortestingnodejs@gmail.com',
            pass: 'idrlxprfmuljerqb'
        }
    });

    const user_mail = req.body.email
    // console.log('mmmmm',user_mail)

    const mailOptions = {
        from: "fortestingnodejs@gmail.com",
        to: user_mail,
        subject: "Testing",
        text: `<p>Thank you for subscribing to our Services </p>`,
        html: output
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        // console.log("Message sent: ", user_mail)

        // res.json('Success')
        res.redirect("/");
    });
});

module.exports = router