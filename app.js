const express = require('express');
const path = require('path');
const app = express();
const mongoose = require('mongoose');
const config = require('./config');
const passport = require('passport');
const session = require('express-session');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
var hbs = require('hbs');
// Route imports
const authRoute = require('./routes/auth');
const categoryRoute = require('./routes/categories');

// Initialize Passport
require('./passport');

// Connect to the database
mongoose.connect(config.dbConnstring).then(() => { console.log("conn successful")});


// Global models
global.User = require('./src/models/user');

// Set view engine and directories
const static_path = path.join(__dirname, 'public');
const viewsPath = path.join(__dirname, 'templates/views');
const partialPaths = path.join(__dirname, 'templates/partials');

app.set('view engine', 'hbs');
app.set('views', viewsPath);
hbs.registerPartials(partialPaths);


// Middleware setup
app.use(logger('dev'));
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cookieParser());
app.use(session({
    secret: config.sessionKey,
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// Serve static files
app.use(express.static(static_path));

// Route handling
app.use('/', authRoute);
app.use('/', categoryRoute);
app.use(function (req, res, next) {
    if (req.isAuthenticated()) {
        res.locals.user = req.user;
    }
    next();
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Error handler
// app.use(function (err, req, res, next) {
//     res.locals.message = err.message;
//     res.locals.error = req.app.get('env') === 'development' ? err : {};
//     res.status(err.status || 500);
//     res.render('error');
// });

// Middleware to redirect logged-in users to the home page


module.exports = app;
