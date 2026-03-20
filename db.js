const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        // This "knocks on the door" of your MongoDB Atlas
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ MongoDB Atlas Connected Successfully! Your database is live.');
    } catch (error) {
        console.error('❌ MongoDB Connection Failed:', error.message);
        process.exit(1); // Stop the server if database fails
    }
};

module.exports = connectDB;