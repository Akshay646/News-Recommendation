var express = require('express');
var router = express.Router();
const axios = require('axios'); // Add axios for making HTTP requests
const getCountry = require('../utils/country'); // Import the server-side utility function

// Route for "For You" page
router.get('/profile', (req, res) => {
    res.render('profile', {
        user: req.user,
        showProfileBox: req.isAuthenticated() ? 'block' : 'none'
    });
});

async function getPersonalizedNews(user) {
    console.log(user);
    const preferences = user.preferences; // Array of preferences, e.g., ["technology", "health"]
    const news = [];

    try {
        const country = await getCountry();
        for (const preference of preferences) {
            const response = await axios.get(`https://recommendation-api-jw38.onrender.com/api/news/search?q=${preference}&country=${country}`);
            news.push(...response.data.articles); // Combine all articles from different preferences
        }
    } catch (error) {
        console.error('Error fetching news:', error);
    }

    return news;
}

//Do not forget that we always show personalised news that we store in the session, if user is nt signed in, we show latest news
// Home route
router.get('/', async (req, res) => {
    try {
        let news = [];

        if (req.isAuthenticated()) {
            // Check if personalized news is already stored in the session
            if (!req.session.personalizedNews) {
                // Fetch personalized news if not already stored in session
                news = await getPersonalizedNews(req.user);
                // Store news in the session
                req.session.personalizedNews = news;
            } else {
                // Use personalized news from the session
                news = req.session.personalizedNews;
            }
            res.render('index', { news })
        }
        else if (req.session.categoryFeeds) {
            // Use personalized news from session
            // Use category feeds from session if 1available
            news = req.session.categoryFeeds;
            res.render('index', { news });
        }
        else {
            // If not authenticated and no category feeds, fetch latest news
            //news = await newsFeed.getLatestNews(); // Assuming this function fetches the latest news
            //req.session.categoryFeeds = news; // Cache it in session for future requests
        }

        // Render the index page with the appropriate news
        res.render('index', { news });
    } catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).send(error);
    }
});

router.get('/foryou', async (req, res) => { // Make the route handler async
    if (req.isAuthenticated()) {
        try {
            // Redirect to the index page
            res.redirect('/');
        } catch (error) {
            console.error('Error processing personalized news:', error);
            res.status(500).send('Internal Server Error');
        }
    } else {
        res.render('login_for_you');
    }
});

module.exports = router;
