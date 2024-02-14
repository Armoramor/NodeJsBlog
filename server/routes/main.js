const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

/**
 * GET/HOME
 */
//Routes
router.get('', async (req, res) => {
    const locals = {
        title: "NodeJs Blog",
        description: "Petit blog fait avec NodeJs, Express et MongoDb."
    }
    try {
        let perPage = 4;
        let page = req.query.page || 1;

        const data = await Post.aggregate([{ $sort: { createdAt: -1 } }])
            .skip(perPage * page - perPage)
            .limit(perPage)
            .exec();
        const count = await Post.countDocuments();
        const nextPage = parseInt(page) + 1;
        const hasNextPage = nextPage <= Math.ceil(count / perPage);


        res.render("index", { locals, data, current: page, nextPage: hasNextPage ? nextPage : null, currentRoute: '/' });
        // va trouver tous les posts
    } catch (error) {
        console.log(error);
    }


    //appel du fichier index.ejs | les {} permettent de passer plusieurs objets en option
});

// function insertPostData() {
//     Post.insertMany([{
//         title: "Buildinga blog",
//         body: "This is the body text"
//     },
//     ])

// }
// insertPostData();

/**
 * GET/Post :id
 */
//
router.get('/post/:id', async (req, res) => {
    try {

        let slug = req.params.id;
        const data = await Post.findById({ _id: slug });
        const locals = {
            title: data.title,
            description: "Petit blog fait avec NodeJs, Express et MongoDb."
        }
        res.render("post", { locals, data, currentRoute: `/post/${slug}` });

    } catch (error) {
        console.log(error);
    }



});
/**
 * Post/search
 */
//
router.post('/search', async (req, res) => {
    try {
        let searchTerm = req.body.searchTerm;
        const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9]/g, "");
        const data = await Post.find({
            $or: [
                {
                    title: { $regex: new RegExp(searchNoSpecialChar, 'i') }
                },
                {
                    body: { $regex: new RegExp(searchNoSpecialChar, 'i') }
                }
            ]
        });

        const locals = {
            title: data.title,
            description: "Petit blog fait avec NodeJs, Express et MongoDb."
        }

        res.render("search", { locals, data });

    } catch (error) {
        console.log(error);
    }
});





router.get('/about', (req, res) => {
    res.render("about", {
        currentRoute: '/about'
    }); //appel du fichier about.ejs
});


router.get('/contact', (req, res) => {
    res.render("contact", {
        currentRoute: '/contact'
    }); //appel du fichier about.ejs
});

module.exports = router;