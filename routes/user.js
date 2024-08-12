var express = require('express');
var router = express.Router();

// Route for "For You" page
router.get('/profile', (req, res) => {
    res.render('profile', {
        user: req.user,
        showProfileBox: req.isAuthenticated() ? 'block' : 'none'
    });
});



