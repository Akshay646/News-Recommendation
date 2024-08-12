const express = require('express');
const router = express.Router();
const axios = require('axios'); // Add axios for making HTTP requests

async function getPersonalizedNews(user) {
    const preferences = user.preferences; // Array of preferences, e.g., ["technology", "health"]
    const news = [];

    try {
        for (const preference of preferences) {
            const response = await axios.get(`https://recommendation-api-jw38.onrender.com/api/news/search?q=${preference}`);
            news.push(...response.data.articles); // Combine all articles from different preferences
        }
    } catch (error) {
        console.error('Error fetching news:', error);
    }

    return news;
}

router.get('/foryou', async (req, res) => { // Make the route handler async
    if (req.isAuthenticated()) {
        try {
            const personalizedNews = await getPersonalizedNews(req.user); // Await the async function
            req.session.personalizedNews = personalizedNews;
            // Redirect to the index page
            res.redirect('/index');
        } catch (error) {
            console.error('Error processing personalized news:', error);
            res.status(500).send('Internal Server Error');
        }
    } else {
        res.render('login_for_you');
    }
});

module.exports = router;
