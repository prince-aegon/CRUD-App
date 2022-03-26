const mongoose = require('mongoose');

// Schema of the database
const articleSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    }
});

// Store the collection in 'Article'
const Article = module.exports = mongoose.model('Article', articleSchema);