const express = require('express');
const router = express.Router();
const axios = require('axios'); // Add axios for making HTTP requests
const getCountry = require('../utils/country'); // Import the server-side utility function

async function fetchNews(category) {
    const news = [];

    try {
        const country = await getCountry();
        const response = await axios.get(`https://recommendation-api-jw38.onrender.com/api/news/search?q=${category}&country=${country}`);
        news.push(...response.data.articles); // Combine all articles
        
    } catch (error) {
        console.error('Error fetching news:', error);
    }

    return news;
}

router.get('/category', async (req, res) => {
    // Extract the topic query parameter from the request
    const topic = req.query.topic;
    const articles = await fetchNews(topic);
    console.log(req.user);
    req.session.categoryFeeds = articles;
    // Render a template and pass the topic and articles to the view
    return res.redirect('/');
});

module.exports = router;
// Export the method
