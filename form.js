// Import required modules
const express = require('express');
const { MongoClient } = require('mongodb');

// Create Express application
const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection details
const url = 'mongodb+srv://samanthachan642565:Samantha7262@cluster0.xvsg0de.mongodb.net/stockticker';

app.use(express.urlencoded({ extended: true }));

// Serve HTML form
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/form.html');
});

// Handle search requests
app.post('/search', handleLookup);

// Start the Express server
app.listen(PORT, () => {
    console.log(`Running on http://localhost:${PORT}`);
});

// Query MongoDB based on search input and type
async function queryMongoDB(client, searchInput, searchType) {
    const db = client.db('stockticker');
    const query = buildQuery(searchInput, searchType);
    return await db.collection('Companies').find(query).toArray();
}

// Build MongoDB query based on search type
function buildQuery(searchInput, searchType) {
    return searchType === 'ticker' ? { ticker: searchInput } : { company: { $regex: new RegExp(searchInput, 'i') } };
}

// Format results
function formatResult(companies) {
    return companies.map(({ company, ticker, price }) => `${company} (${ticker}): $${price}`).join('\n');
}

// Handle errors 
function handleError(res, error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
}

// Close MongoDB connection
async function closeMongoDBConnection(client) {
    if (client) {
        await client.close();
    }
}

// Handle search requests
async function handleLookup(req, res) {
    const { searchInput, searchType } = req.body;
    let client;

    try {
        // Connect to MongoDB
        client = new MongoClient(url);
        await client.connect();

        // Query MongoDB, format result, and send response
        const companies = await queryMongoDB(client, searchInput, searchType);
        const formattedResult = formatResult(companies);
        res.send(`<pre>${formattedResult}</pre>`);
    } catch (error) {
        // Handle errors
        handleError(res, error);
    } finally {
        // Close MongoDB connection
        if (client) {
            await closeMongoDBConnection(client);
        }
    }
}
