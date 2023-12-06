// Import required modules 
const fs = require('fs');
const readline = require('readline');
const { MongoClient } = require('mongodb');

// MongoDB connection details 
const url = 'mongodb+srv://samanthachan642565:Samantha7262@cluster0.xvsg0de.mongodb.net/stockticker?retryWrites=true&w=majority';
const dbName = 'stockticker';
const collectionName = 'Companies';

// Insert data from CSV file into MongoDB
async function insertCSVData(filePath, client) {

    // Use readline module to read CSV file 
    const rl = readline.createInterface({
        input: fs.createReadStream(filePath),
        crlfDelay: Infinity,
    });

    // Access database 'stockticker' and collection within the database 'Companies'
    const database = client.db(dbName);
    const collection = database.collection(collectionName);

    // Go through each line of CSV file 
    for await (const line of rl) {
        
        // Split each line into an array of values using the , as delimiier
        const [company, ticker, price] = line.split(',');

        // Insert document into the collection 
        await collection.insertOne({
            company,
            ticker,
            price: parseFloat(price),
        });

        // Display inserted data into console
        console.log('Inserted: ' + company + ', ' + ticker + ', ' + price);
    }
}

// Connect to MongoDB, insert data from CSV file, and deal with errors
async function connectAndInsert() {
    const client = new MongoClient(url);

    try {

        // Connect to MongoDB
        await client.connect();

        // Call function to insert data from CSV file 
        await insertCSVData('companies.csv', client);
    } catch (error) {

        // Handle errors 
        console.error(error);
    } finally {

        // Close MongoDB connection 
        await client.close();
    }
}

// Call the function to connect to MongoDB and insert data 
connectAndInsert();