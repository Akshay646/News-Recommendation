const axios = require('axios');

// Function to fetch the user's country based on IP
async function getCountry() {
    try {
        const response = await axios.get('http://ip-api.com/json/');
        return response.data.country;
    } catch (error) {
        console.error('Error fetching country information:', error);
        throw new Error('Could not fetch country information');
    }
}

module.exports = getCountry;
