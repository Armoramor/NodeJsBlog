const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const adminLayout = '../views/layouts/admin';

const jwtSecret = process.env.JWT_SECRET;

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//check login 
const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: "Non autorisé" });
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ message: "Non autorisé" })
    }
}

// GET / admin dashboard

router.get('/dashboard', authMiddleware, async (req, res) => {

    try {

        const locals = {
            title: 'Dashboard',
            description: 'Ici, tu commandes!'

        }
        const data = await Post.find();
        res.render('admin/dashboard', {
            locals, data, layout: adminLayout
        })



    } catch (error) {
        console.log(error);
    }

})
//get nouvel article

router.get('/add-post', authMiddleware, async (req, res) => {

    try {

        const locals = {
            title: 'Ajouter un article',
            description: 'Ici, tu commandes!'

        }
        const data = await Post.find();
        res.render('admin/add-post', {
            locals, data, layout: adminLayout
        })



    } catch (error) {
        console.log(error);
    }

})

// Post / creer un nouvel article


router.post('/add-post', authMiddleware, async (req, res) => {

    try {
        try {

            const newPost = new Post({
                title: req.body.title,
                body: req.body.body
            });

            await Post.create(newPost);
            res.redirect('dashboard');

        } catch (error) {
            console.log(error);
        }

    } catch (error) {
        console.log(error);
    }

})

// get/ admin _ edit post
router.get('/edit-post/:id', authMiddleware, async (req, res) => {

    try {
        const locals = {
            title: 'Ajouter un article',
            description: 'Ici, tu commandes!'

        }
        const data = await Post.findOne({ _id: req.params.id });
        res.render('admin/edit-post', {
            locals,
            data,
            layout: adminLayout
        })

    } catch (error) {
        console.log(error);
    }

})





// PUT / admin _ edit post
router.put('/edit-post/:id', authMiddleware, async (req, res) => {

    try {
        await Post.findByIdAndUpdate(req.params.id, {

            title: req.body.title,
            body: req.body.body,
            updatedAt: Date.now()

        })
        res.redirect(`/edit-post/${req.params.id}`);

    } catch (error) {
        console.log(error);
    }

})

//delete

router.delete('/delete-post/:id', authMiddleware, async (req, res) => {
    try {
        await Post.deleteOne({ _id: req.params.id });
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
    }

});



// Get / Admin login page

router.get('/admin', async (req, res) => {

    try {
        const locals = {
            title: "Administrateur",
            description: "Petit blog fait avec NodeJs, Express et MongoDb."
        }


        res.render("admin/index", { locals, layout: adminLayout });

    } catch (error) {
        console.log(error);
    }


    //appel du fichier index.ejs | les {} permettent de passer plusieurs objets en option
});
// Post/ admin - enregistrement

router.post('/register', async (req, res) => {

    try {

        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const user = await User.create({ username, password: hashedPassword })
            res.status(201).json({ message: 'User créer', user });
        } catch (error) {
            if (error.code === 11000) {
                res.status(409).json({ message: 'User déjà enregistrer' });
            }
            res.status(500).json({ message: 'Internal server error' });
        }

        res.render("admin/index", { locals, layout: adminLayout });

    } catch (error) {
        console.log(error);
    }


    //appel du fichier index.ejs | les {} permettent de passer plusieurs objets en option
});


// post / Admin - check login 
router.post('/admin', async (req, res) => {

    try {

        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ message: 'Entrée invalide' });

        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Entrée invalide' });
        }

        const token = jwt.sign({ userId: user._id }, jwtSecret);
        res.cookie('token', token, { httpOnly: true });

        res.redirect('/dashboard');

        res.render("admin/index", { locals, layout: adminLayout });

    } catch (error) {
        console.log(error);
    }


    //appel du fichier index.ejs | les {} permettent de passer plusieurs objets en option
});

router.get('/dashboard', authMiddleware, async (req, res) => {

    res.render('admin/dashboard');
});

//get / admin deco
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
})

// router.get('/admin', (req, res) => {
//     // Définir currentRoute
//     const currentRoute = '/admin'; // ou toute autre logique pour déterminer la route actuelle

//     // Rendre le modèle avec currentRoute
//     res.render('admin', { currentRoute: currentRoute });
// });


module.exports = router;