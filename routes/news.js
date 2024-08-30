const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');


// Define the schema with text indexes
const newsSchema = new mongoose.Schema({}, { strict: false });
// Create a compound text index on the relevant fields
newsSchema.index({ title: "text", description: "text", link: "text", category: "text" });

const News = mongoose.model('News', newsSchema, 'DataSet');

// Fetch news by category from MongoDB
async function searchNewsByCategory(category, page = 1, limit = 100) {
    try {
        const news = await News.find({ category: category })
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();

        const totalCount = await News.countDocuments({ category: category });
        return { news, totalCount };
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


//search news by keyword
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

        const totalCount = await News.countDocuments(searchQuery);

        return res.render('index', {
            news: news,
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

module.exports = router;



//fetch news by category

//fetch recommendations by providing description and title of the news.
//When user selects any news, store/pass news title and desciption and may be other related field combined
//with the key 'description' as out  recommendation engine expects a key 'description' to be passed via request body

