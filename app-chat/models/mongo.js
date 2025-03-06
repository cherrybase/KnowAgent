// db.js
const mongoose = require('mongoose');
const { secrets } = require("./../services/secret")
const connectDB = async () => {
  try {
    const mongoURI = secrets.mongo.uri; 
    const dbName = secrets.mongo.dbName;

    if (!mongoURI) {
      throw new Error('MONGO_URI environment variable is not defined.');
    }
    if(!dbName){
        throw new Error('DB_NAME environment variable is not defined.')
    }

    const connection = await mongoose.connect(mongoURI, { dbName : dbName });
    console.log(`MongoDB Connected: ${connection.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

module.exports = { connectDB };