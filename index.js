const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const config = require('./config/database');
const passport = require('passport');


// This will connect to the database
mongoose.connect(config.database);

// db will carry status of connection
const db = mongoose.connection;

// Check connection
db.once('open', () => {
    console.log('Connected to Database')
})

// check for db errors
db.on('error', () => {
    console.log(err)
});

const app = express();

// Bring in models/schema
const Article = require('./models/article');

// Load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({
    extended: true
}));// parse application/json
// app.use(express.json());
var methodOverride = require('method-override')

// override with POST having ?_method=PUT
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')));

// Express session
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    // cookie: { secure: true }
}));

// Express messages
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});


// Passport config
require('./config/passport')(passport);

app.use(passport.initialize());
app.use(passport.session());

app.get('*', function (req, res, next) {
    res.locals.user = req.user || null;
    next();
})

// Home page
app.get('/', (req, res) => {
    console.log('Server Req: Home page')
    const title = "Articles";

    // articles is the collection we assigned in mongo
    Article.find({}, (err, articles) => {
        if (err) {
            console.log(err);
        }
        else {
            // send articles collection for rendering
            res.render('index', { title, articles })
        }
    });
});


// Route
let articles = require('./routes/articles');
let users = require('./routes/users');

app.use('/articles', articles);
app.use('/users', users);



// Start Server
app.listen(3000, () => {
    console.log("Server running at port 3000...")
})