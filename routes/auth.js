var express = require('express');
var router = express.Router();
var passport = require('passport');
const { body, validationResult } = require('express-validator');

// Middleware to redirect if authenticated
function redirectIfAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/index'); // Redirect to home if already logged in
    }
    next();
}

// Ensure user is authenticated
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

// GET /login
router.get('/login', redirectIfAuthenticated, function (req, res) {
    res.render('login', { title: 'Login Your Account' });
});

// POST /login
router.post("/login", passport.authenticate("local", {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true // Optionally use flash messages for errors
}));

// GET /register
router.get('/register', redirectIfAuthenticated, function (req, res) {
    res.render('register', { title: 'Register Your Account' });
});

// POST /register
router.post(
    '/register',
    [
        body('name').notEmpty().withMessage('Empty Name'),
        body('email').isEmail().withMessage('Invalid email'),
        body('password').notEmpty().withMessage('Empty Password'),
        body('confirmPassword').notEmpty().withMessage('Empty Confirm Password'),
        body('password').custom((value, { req }) => {
            if (value !== req.body.confirmPassword) {
                throw new Error('Passwords do not match');
            }
            return true;
        }),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('register', {
                name: req.body.name,
                email: req.body.email,
                errorMessages: errors.array(),
            });
        }

        try {
            // Check if a user with the same email already exists
            const existingUser = await User.findOne({ email: req.body.email });
            if (existingUser) {
                return res.render('register', {
                    name: req.body.name,
                    email: req.body.email,
                    errorMessages: [{ msg: 'User already exists, please login.' }],
                });
            }

            // If validation passes and user does not exist, proceed with registration logic
            const user = new User();
            user.name = req.body.name;
            user.email = req.body.email;
            user.preferences = req.body['news-topics'];
            user.country = req.body.country;
            user.setPassword(req.body.password);

            await user.save(); // Await the promise instead of using a callback

            res.redirect('/login');
        } catch (err) {
            console.log(err);
            return res.render('register', { errorMessages: [{ msg: 'Error saving user' }] });
        }
    }
);


// Logout route
router.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        req.session.destroy(err => {
            if (err) { return next(err); }
            // Redirect to home page with query parameter
            res.redirect('/');
        });
    });
});

// Protected route example
router.get('/protected', ensureAuthenticated, (req, res) => {
    res.render('protected');
});

module.exports = router;
