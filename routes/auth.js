var express = require('express');
var router = express.Router();
var passport = require('passport');
const { body, validationResult } = require('express-validator');

function redirectIfAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/index'); // Redirect to home if already logged in
    }
    next();
}

// GET /login
router.get('/login', redirectIfAuthenticated, function (req, res) {
    res.render('login', { title: 'Login Your Account' });
});


router.get('/', (req, res) => {
    // Check if the user is authenticated
    if (req.isAuthenticated()) {
        const personalizedNews = req.session.personalizedNews || [];
        if (personalizedNews != null) {
            // Render the index page with personalized news
            res.render('index', { news: personalizedNews });
        }
        res.render('index');

    }
    // Render the home page without user data
    res.render('index');
});


router.post("/login", passport.authenticate("local", {
    successRedirect: '/',
    failureRedirect: '/login'
}), function (req, res) {
});

router.get('/register', function (req, res) {
    res.render('register', { title: 'Register Your Account' })
});


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
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.render('register', {
                    name: req.body.name,
                    email: req.body.email,
                    errorMessages: errors.array(),
                });
            }

            // If validation passes, proceed with registration logic
            const user = new User();
            user.name = req.body.name;
            user.email = req.body.email;
            user.preferences = req.body['news-topics'];
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

//Use middleware to protect routes that require authentication. This middleware checks if a user is authenticated and redirects them to the login page if they are not:
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}
router.get('/protected', ensureAuthenticated, (req, res) => {
    res.render('protected');
});


module.exports = router;