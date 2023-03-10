const express = require('express')
const hbs = require('hbs')
const path = require('path')

const app = express()

//paths for express config
const publicDirectory = path.join(__dirname, '../public')
const viewsPath = path.join(__dirname, '../templates/views')
const partialsPath = path.join(__dirname, '../templates/partials')

// Setup handlebars engine and views location
app.set('view engine', 'hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)

// Setup static dictionary to serve
app.use(express.static(publicDirectory))

app.get('', (req,res) => {
    res.render("index")
})

app.get("/best_sellers", (req, res) => {
  res.render("best_sellers");
});

app.get("/about", (req, res) => {
  res.render("about", {
    title: "About ME",
    name: "Jay Gajjar",
  });
});

app.listen(3000, () => {
    console.log("connected to server")
})