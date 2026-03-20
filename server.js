const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); 
const path = require('path');
require('dotenv').config();

const app = express();

// ==========================================
// 1. SECURITY & MIDDLEWARE
// ==========================================
// Allow all origins (prevents CORS blocking on Vercel domains)
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static Frontend Files (HTML, CSS, JS, Images)
app.use(express.static(path.join(__dirname, '/')));

// ==========================================
// 2. DATABASE CONNECTION (Optimized for Vercel)
// ==========================================
const connectDB = async () => {
    if (mongoose.connections[0].readyState) {
        console.log('🌵 Using existing MongoDB connection');
        return;
    }
    try {
        if (!process.env.MONGO_URI) {
            console.error('❌ MONGO_URI is missing in Vercel Environment Variables!');
            return;
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Atlas Connected Successfully');
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err);
    }
};

// Middleware to ensure Database connects BEFORE processing any /api/ route
app.use('/api', async (req, res, next) => {
    await connectDB();
    next();
});

// ==========================================
// 3. MONGODB SCHEMAS 
// (Using mongoose.models to prevent Vercel Overwrite Errors)
// ==========================================
const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
    first_name: { type: String, required: true },
    father_name: { type: String, required: true },
    grandfather_name: { type: String, required: true },
    email: { type: String },
    nationality: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true } 
}, { timestamps: true }));

const Booking = mongoose.models.Booking || mongoose.model('Booking', new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    event_type: { type: String, required: true },
    date: { type: String, required: true },
    guests: { type: Number },
    details: { type: String },
    debit_account: { type: String, required: true }
}, { timestamps: true }));

const Contact = mongoose.models.Contact || mongoose.model('Contact', new mongoose.Schema({
    contact_name: { type: String, required: true },
    contact_email: { type: String, required: true },
    message: { type: String, required: true }
}, { timestamps: true }));

const Affiliate = mongoose.models.Affiliate || mongoose.model('Affiliate', new mongoose.Schema({
    aff_name: { type: String, required: true },
    company: { type: String },
    aff_email: { type: String, required: true },
    promo_method: { type: String, required: true }
}, { timestamps: true }));

const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', new mongoose.Schema({
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    feedback: { type: String, required: true }
}, { timestamps: true }));

// ==========================================
// 4. API ENDPOINTS (Routes)
// ==========================================
app.get('/api/ping', (req, res) => res.status(200).json({ message: "Server is awake!" }));

// 🔒 SECURE REGISTER
app.post('/api/register', async (req, res) => {
    try {
        const existingUser = await User.findOne({ phone: req.body.phone });
        if (existingUser) return res.status(400).json({ success: false, message: "Phone number already registered." });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const newUser = new User({ ...req.body, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ success: true, message: "Registration successful" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error", error: err.message });
    }
});

// 🔒 SECURE LOGIN
app.post('/api/login', async (req, res) => {
    try {
        const { phone, password } = req.body;
        const user = await User.findOne({ phone });
        if (!user) return res.status(401).json({ success: false, message: "Invalid phone number or password." });

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) res.status(200).json({ success: true, message: "Login successful" });
        else res.status(401).json({ success: false, message: "Invalid phone number or password." });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
});

// Submit Booking
app.post('/api/submit-booking', async (req, res) => {
    try {
        await new Booking(req.body).save();
        res.status(201).json({ success: true, message: "Booking received successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error submitting booking", error: err.message });
    }
});

// Submit Contact
app.post('/api/submit-contact', async (req, res) => {
    try {
        await new Contact(req.body).save();
        res.status(201).json({ success: true, message: "Message sent successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error sending message", error: err.message });
    }
});

// Submit Affiliate
app.post('/api/submit-affiliate', async (req, res) => {
    try {
        await new Affiliate(req.body).save();
        res.status(201).json({ success: true, message: "Affiliate application received" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error submitting application", error: err.message });
    }
});

// Submit Feedback
app.post('/api/submit-feedback', async (req, res) => {
    try {
        await new Feedback(req.body).save();
        res.status(201).json({ success: true, message: "Feedback saved successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error saving feedback", error: err.message });
    }
});

// Catch-all route to prevent 404s when manually typing URLs in browser
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ==========================================
// 5. START SERVER / VERCEL EXPORT
// ==========================================
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Local Server running on port ${PORT}`));
}

// Crucial step for Vercel mapping 
module.exports = app;
