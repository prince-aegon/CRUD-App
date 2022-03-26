const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');



// Bring in models/schema
const Article = require('../models/article');

const User = require('../models/user');

// This is the page for adding
router.get('/add', ensureAuthenticated, (req, res) => {
    console.log('Server Req: Add Page')

    const title = "Add Articles";
    res.render('add', { title, errors: null });
});


// Page for single article

router.get('/:id', (req, res) => {
    Article.findById(req.params.id, (err, article) => {
        User.findById(article.author, function (err, user) {
            res.render('article', { article: article, author: user.name })
        })
        console.log("Server Req: " + article.author);
    })
})

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    else {
        req.flash('danger', 'Please Login');
        res.redirect('/users/login');
    }
}

// Edit article

router.get('/edit/:id', (req, res) => {
    Article.findById(req.params.id, (err, article) => {
        console.log("Server Req: Edit " + article.author);
        if (article.author != req.user._id) {
            req.flash('danger', 'Not Authorized');
            res.redirect('/');
        }
    })
    Article.findById(req.params.id, (err, article) => {
        res.render('edit', { article })
    });
})


// This is where submit will take us
router.post('/add',
    body('title').isLength({ min: 1 }).withMessage('Title Required'),
    // body('author').isLength({ min: 1 }).withMessage('Author Required'),
    body('Body').isLength({ min: 1 }).withMessage('Body Required'),
    (req, res) => {

        let article = new Article({
            title: req.body.title,
            author: req.body.author,
            body: req.body.Body
        });
        // console.log('Submit successful')
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors);
            res.render('add', {
                title: 'Add Article',
                errors
            });
        }
        // if (!errors.isEmpty()) {
        //     res.json(errors)
        // }
        else {
            const article = new Article();
            article.title = req.body.title;
            article.author = req.user._id;
            article.body = req.body.Body;

            article.save((err) => {
                if (err) {
                    console.log(err);
                }
                else {
                    req.flash('success', 'Article Added Successfully');
                    res.redirect('/');
                }
            });
        }
    })

// This is where submit will take us
router.post('/edit/:id', (req, res) => {
    // console.log('Submit successful')

    const article = {};
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.Body;

    const query = { _id: req.params.id }

    Article.updateOne(query, article, (err) => {
        if (err) {
            console.log(err);
            return;
        }
        else {
            req.flash('success', 'Article Edited Successfully')
            res.render('edit_success', { article });
        }
    });
})


// Deleting using jQuery and AJAX
router.delete('/:id', (req, res) => {
    if (!req.user._id) {
        res.status(500).send();
    }
    let query = { _id: req.params.id }
    Article.findById(req.params.id, function (err, article) {
        if (article.author != req.user._id) {
            res.status(500).send();
        }
        else {
            Article.remove(query, function (err) {
                if (err) {
                    console.log(err);
                }
                res.send('Success');
            });
        }
    })

});


// Deleting using findbyIdandDelete
// app.delete('/article/:id', async (req, res) => {
//     const query = { _id: req.params.id };
//     await Article.findByIdAndDelete(query);
//     res.redirect('/');
// });
module.exports = router;