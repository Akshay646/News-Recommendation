const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const axios = require('axios'); // Add axios for making HTTP requests

// Define the schema with text indexes
const newsSchema = new mongoose.Schema({}, { strict: false });
// Create a compound text index on the relevant fields
newsSchema.index({ title: "text", description: "text", link: "text", category: "text" });

const News = mongoose.model('News', newsSchema, 'DataSet');

// Utility function to truncate description to a max of 40 words
function truncateDescription(description, wordLimit = 40) {
    if (!description) return '';
    const words = description.split(' ');
    if (words.length > wordLimit) {
        return words.slice(0, wordLimit).join(' ') + '...';  // Add ellipsis at the end
    }
    return description;
}

// Fetch news by category from MongoDB with truncated descriptions
async function searchNewsByCategory(category, page = 1, limit = 100) {
    try {
        const news = await News.find({ category: category })
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();

        // Truncate descriptions
        const truncatedNews = news.map(item => ({
            ...item._doc,
            description: truncateDescription(item.description),
        }));

        const totalCount = await News.countDocuments({ category: category });
        return { news: truncatedNews, totalCount };
    } catch (error) {
        console.error('Error searching news by category:', error.message);
        return { news: [], totalCount: 0 };
    }
}

// Route to fetch and render news based on category
router.get('/category', async (req, res) => {
    const topic = req.query.topic;
    const page = parseInt(req.query.page) || 1;
    const limit = 100;

    console.log('Category route accessed. Topic:', topic);

    // Fetch news based on the topic from MongoDB with pagination
    const { news, totalCount } = await searchNewsByCategory(topic, page, limit);
    req.session.categoryFeeds = news;

    // Render the index view with the topic, articles, and pagination information
    return res.render('index', {
        news: news,
        topic,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
    });
});

// Route to search news by keyword with truncated descriptions
router.get('/search', async (req, res) => {
    const { q } = req.query; // Assuming the keyword is passed as 'q'
    const page = parseInt(req.query.page) || 1;
    const limit = 100;

    try {
        const searchQuery = {
            $text: { $search: q }
        };

        const news = await News.find(searchQuery, {
            score: { $meta: "textScore" } // Include text score in the projection
        })
            .sort({ score: { $meta: "textScore" } }) // Sort by text score
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();

        // Truncate descriptions
        const truncatedNews = news.map(item => ({
            ...item._doc,
            description: truncateDescription(item.description),
        }));

        const totalCount = await News.countDocuments(searchQuery);

        return res.render('index', {
            news: truncatedNews,
            topic: 'Search Results',
            query: q,
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit),
        });
    } catch (error) {
        console.error('Error searching news:', error.message);
        return res.status(500).send('Error occurred while searching news.');
    }
});

// Route to fetch recommendations
router.post('/recommendation', async (req, res) => {
    try {
        const { title, description } = req.body;
        const combinedDescription = `${title} ${description}`;

        const response = await axios.post('http://127.0.0.1:5000/api/news/recommendations', {
            description: combinedDescription
        });

        if (response.status === 200) {
            const recommendations = response.data;
            return res.json(recommendations);  // Return recommendations as JSON
        } else {
            return res.status(response.status).json({ error: response.statusText });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

module.exports = router;
