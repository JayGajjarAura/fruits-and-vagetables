const express = require('express');
const router = express.Router();
const multer = require("multer");


const category = require('../model/CategoryAdd');
const product = require('../model/productAdd');
const slugify = require('slugify');

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/uploads");
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "-" + Date.now() + ".jpg");
    },
});

let upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

router.post("/category", upload.single("image"), async (req, res) => {
    try {
        const { filename } = req.file;
        // const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
        const imageUrl = `../uploads/${filename}`;

        const newCategory = new category({
            name: req.body.name,
            status: req.body.status,
            image: imageUrl,
            slug: slugify((req.body.name), {
                lower: true,
                strict: true
            })
        });
        // console.log(newCategory)

        await newCategory.save();

        res.json({ message: "Category added Successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).send("Error saving category");
    }
});

router.patch('/category/:id', upload.single("image"), async(req,res)=> {
    try{
        const Category = await category.findById(req.params.id); 

        Category.name = req.body.name || Category.name; 
        Category.status = req.body.status || Category.status; 

        if(req.file) { // Check if new image is uploaded
            const { filename } = req.file;
            const imageUrl = `../uploads/${filename}`;
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

router.post('/category/remove/:id', async (req, res) => {
    const rowID = req.params.id;
    try {
        const Category = await category.findOneAndDelete({_id :rowID});
        // console.log('cateeeeeeeee------------------- removed------------', Category);

        await product.deleteMany({ category: rowID });
        
        res.redirect('/admin/category-view');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

router.post("/products", upload.single("image"), async (req, res) => {

        // console.log("sluggggggg", req.body.title);

    try {
        const { filename } = req.file;
        const imageUrl = `../uploads/${filename}`;

        const newProduct = new product({
            category: req.body.category,
            title: String(req.body.title),
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

        await newProduct.save();

        res.json({ message: "Product added Successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).send("Error saving Product");
    }
});

router.patch('/products/:id', upload.single("image"), async(req,res)=> {
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
            const imageUrl = `../uploads/${filename}`;
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

router.post('/product/remove/:id', async (req, res) => {
    const rowID = req.params.id;
    try {
        const Product = await product.findOneAndDelete({_id :rowID});
        // console.log('product------------------- removed------------', Product);
        
        res.redirect('/product-view');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

router.put("/categories/:categoryId", async (req, res) => {
    const { categoryId } = req.params;
    const { active } = req.body;

    try {
        // Update the category's active status
        const Category = await category.findByIdAndUpdate(
            categoryId,
            { active: active },
            { new: true }
        );

        // Update the associated products' active status based on the category's active status
        await product.updateMany(
            { category: categoryId },
            { active: active },
            { multi: true }
        );

        // If the category is inactive, also hide the associated products
        if (!active) {
            await product.updateMany(
                { category: categoryId },
                { $set: { visible: false } },
                { multi: true }
            );
        }

        res.json(Category);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router