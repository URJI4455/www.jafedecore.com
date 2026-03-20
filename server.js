const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // The password security tool
require('dotenv').config();

const app = express();

// ==========================================
// 1. SECURITY & MIDDLEWARE (Law #3: CORS)
// ==========================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ONLY allow your GitHub Pages URL to access this backend!
// IMPORTANT: Change the github.io link below to your actual frontend URL!
const allowedOrigins = [
    'https://your-github-username.github.io', 
    'http://localhost:5500',
    'http://127.0.0.1:5500'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    methods: ['GET', 'POST'],
    credentials: true
}));

// ==========================================
// 2. DATABASE CONNECTION (MongoDB Atlas)
// ==========================================
// Optimized for Vercel Serverless (Replaces your old mongoose.connect block)
const connectDB = async () => {
    if (mongoose.connections[0].readyState) {
        console.log('🌵 Using existing MongoDB connection');
        return;
    }
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Atlas Connected Successfully');
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err);
    }
};

// Call the function so it runs when the API is hit
connectDB();


// ==========================================
// 3. MONGODB SCHEMAS (Database Structure)
// ==========================================

// User Schema (Registration & Login)
const userSchema = new mongoose.Schema({
    first_name: { type: String, required: true },
    father_name: { type: String, required: true },
    grandfather_name: { type: String, required: true },
    email: { type: String },
    nationality: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true } // This will store the scrambled password
}, { timestamps: true });
const User = mongoose.model('User', userSchema);

// Booking Schema
const bookingSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    event_type: { type: String, required: true },
    date: { type: String, required: true },
    guests: { type: Number },
    details: { type: String },
    debit_account: { type: String, required: true }
}, { timestamps: true });
const Booking = mongoose.model('Booking', bookingSchema);

// Contact Schema
const contactSchema = new mongoose.Schema({
    contact_name: { type: String, required: true },
    contact_email: { type: String, required: true },
    message: { type: String, required: true }
}, { timestamps: true });
const Contact = mongoose.model('Contact', contactSchema);

// Affiliate Schema
const affiliateSchema = new mongoose.Schema({
    aff_name: { type: String, required: true },
    company: { type: String },
    aff_email: { type: String, required: true },
    promo_method: { type: String, required: true }
}, { timestamps: true });
const Affiliate = mongoose.model('Affiliate', affiliateSchema);

// Feedback Schema
const feedbackSchema = new mongoose.Schema({
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    feedback: { type: String, required: true }
}, { timestamps: true });
const Feedback = mongoose.model('Feedback', feedbackSchema);

// ==========================================
// 4. API ENDPOINTS (Routes)
// ==========================================

// Ping Route (to keep Render awake)
app.get('/api/ping', (req, res) => res.status(200).json({ message: "Server is awake!" }));

// 🔒 SECURE REGISTER
app.post('/api/register', async (req, res) => {
    try {
        // 1. Check if user already exists
        const existingUser = await User.findOne({ phone: req.body.phone });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Phone number already registered." });
        }

        // 2. Scramble (Hash) the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        // 3. Save the new user with the scrambled password
        const newUser = new User({
            first_name: req.body.first_name,
            father_name: req.body.father_name,
            grandfather_name: req.body.grandfather_name,
            email: req.body.email,
            nationality: req.body.nationality,
            phone: req.body.phone,
            password: hashedPassword // Save the secure hash, NOT the plain text
        });

        await newUser.save();
        res.status(201).json({ success: true, message: "Registration successful" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error registering user", error: err.message });
    }
});

// 🔒 SECURE LOGIN
app.post('/api/login', async (req, res) => {
    try {
        const { phone, password } = req.body;
        
        // 1. Find the user by phone number
        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid phone number or password." });
        }

        // 2. Compare the typed password with the scrambled password in the database
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (isMatch) {
            res.status(200).json({ success: true, message: "Login successful" });
        } else {
            res.status(401).json({ success: false, message: "Invalid phone number or password." });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
});

// Submit Booking
app.post('/api/submit-booking', async (req, res) => {
    try {
        const newBooking = new Booking(req.body);
        await newBooking.save();
        res.status(201).json({ success: true, message: "Booking received successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error submitting booking", error: err.message });
    }
});

// Submit Contact
app.post('/api/submit-contact', async (req, res) => {
    try {
        const newContact = new Contact(req.body);
        await newContact.save();
        res.status(201).json({ success: true, message: "Message sent successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error sending message", error: err.message });
    }
});

// Submit Affiliate
app.post('/api/submit-affiliate', async (req, res) => {
    try {
        const newAffiliate = new Affiliate(req.body);
        await newAffiliate.save();
        res.status(201).json({ success: true, message: "Affiliate application received" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error submitting application", error: err.message });
    }
});

// Submit Feedback
app.post('/api/submit-feedback', async (req, res) => {
    try {
        const newFeedback = new Feedback(req.body);
        await newFeedback.save();
        res.status(201).json({ success: true, message: "Feedback saved successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error saving feedback", error: err.message });
    }
});

// ==========================================
// 5. START SERVER
// ==========================================

app.get('/', (req, res) => {
  res.send('Jafe Decor Backend API is live and running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
