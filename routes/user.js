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
            const response = await axios.get(`https://newsdata.io/api/1/news?apikey=pub_48828138c1a7fd2c74b3ce209941d0767481c&q=${preference}&country=in`);
            news.push(...response.data.results); // Combine all articles from different preferences
        }
    } catch (error) {
        console.error('Error fetching news:', error);
    }

    return news;
}

//Do not forget that we always show personalised news that we store in the session, if user is nt signed in, we show latest news
router.get('/', async (req, res) => {
    try {
        let news = [];

        // Check if the user is authenticated and no query parameter 'topic' is present
        if (req.isAuthenticated() && !req.query.topic) {
            if (!req.session.personalizedNews) {
                // Fetch and store personalized news in session if not already stored
                news = await getPersonalizedNews(req.user);
                req.session.personalizedNews = news;
            } else {
                // Use personalized news from the session
                news = req.session.personalizedNews;
            }
        }
        // If a 'topic' query parameter is present
        else if (req.query.topic) {
            // Use category feeds stored in session
            news = req.session.categoryFeeds || [];
        }
        // Fallback for unauthenticated users without a topic query
        else {
            // Fetch latest news if not authenticated and no category feeds
            // news = await newsFeed.getLatestNews();
            // req.session.categoryFeeds = news;
        }

        // Render the index page with the fetched news
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
