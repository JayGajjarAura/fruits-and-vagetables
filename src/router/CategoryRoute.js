const express = require("express");
const router = express.Router();
const category = require('../model/CategoryAdd')
const path = require("path");
const multer = require("multer");

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



router.post("/API/category", upload.single("image"), async (req, res) => {
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
        console.log(newCategory)

        await newCategory.save();

        res.json({ message: "Category added Successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).send("Error saving category");
    }
});

router.patch('/API/category/:id', upload.single("image"), async(req,res)=> {
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

router.get('/category-add', (req, res) => {
    // res.send('categoryAdd')
    let AdmindefaultRenderData = AdmingetDefaultRenderData(req);

    const userId = AdmindefaultRenderData.user.userId;

    // if(!userId) {
    //     res.redirect('admin')
    // }

    try {
        res.render('categoryAdd', {
            AdmindefaultRenderData
        })
    } catch (err) {
        res.send(err)
    }
})

router.get('/category-view', async (req, res) => {
    // res.send('categoryView')
    let AdmindefaultRenderData = AdmingetDefaultRenderData(req);

    const userId = AdmindefaultRenderData.user.userId;

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
            AdmindefaultRenderData,
            categoryData: categoryData,
        })
    } catch (err) {
        res.send(err,'error')
    }
})

router.post('/category/remove/:id', async (req, res) => {
    const rowID = req.params.id;
    try {
        const Category = await category.findOneAndDelete({_id :rowID});
        console.log('cateeeeeeeee------------------- removed------------', Category);

        await product.deleteMany({ category: rowID });
        
        res.redirect('/category-view');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

router.put("/api/categories/:categoryId", async (req, res) => {
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