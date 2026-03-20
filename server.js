const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); 
require('dotenv').config();

const app = express();

// ==========================================
// 1. SECURITY & CORS (Fixes 405 Errors)
// ==========================================
app.use(cors({ origin: '*' }));
app.options('*', cors()); // Manually answer browser Pre-flight checks

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// 2. DATABASE CONNECTION
// ==========================================
const connectDB = async () => {
    if (mongoose.connections[0].readyState) return;
    try {
        if (!process.env.MONGO_URI) {
            console.error('❌ MONGO_URI is missing!');
            return;
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Atlas Connected Successfully');
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err);
    }
};

// Ensure DB is connected before any /backend route
app.use('/backend', async (req, res, next) => {
    await connectDB();
    next();
});

// ==========================================
// 3. MONGODB SCHEMAS
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
// 4. API ENDPOINTS (Renamed to /backend to bypass Vercel restrictions)
// ==========================================
app.get('/backend/ping', (req, res) => res.status(200).json({ message: "Server awake!" }));

app.post('/backend/register', async (req, res) => {
    try {
        const existingUser = await User.findOne({ phone: req.body.phone });
        if (existingUser) return res.status(400).json({ success: false, message: "Phone already registered." });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        await new User({ ...req.body, password: hashedPassword }).save();
        res.status(201).json({ success: true });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.post('/backend/login', async (req, res) => {
    try {
        const user = await User.findOne({ phone: req.body.phone });
        if (!user) return res.status(401).json({ success: false, message: "Invalid credentials." });

        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (isMatch) res.status(200).json({ success: true });
        else res.status(401).json({ success: false, message: "Invalid credentials." });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.post('/backend/submit-booking', async (req, res) => {
    try { await new Booking(req.body).save(); res.status(201).json({ success: true }); } 
    catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.post('/backend/submit-contact', async (req, res) => {
    try { await new Contact(req.body).save(); res.status(201).json({ success: true }); } 
    catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.post('/backend/submit-affiliate', async (req, res) => {
    try { await new Affiliate(req.body).save(); res.status(201).json({ success: true }); } 
    catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.post('/backend/submit-feedback', async (req, res) => {
    try { await new Feedback(req.body).save(); res.status(201).json({ success: true }); } 
    catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Fallback
app.use((req, res) => res.status(404).json({ success: false, message: "Endpoint not found" }));

module.exports = app;});

// LOGIN
app.post('/api/login', async (req, res) => {
    try {
        const { phone, password } = req.body;
        const user = await User.findOne({ phone });
        if (!user) return res.status(401).json({ success: false, message: "Invalid phone number or password." });

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) res.status(200).json({ success: true, message: "Login successful" });
        else res.status(401).json({ success: false, message: "Invalid credentials." });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
});

// BOOKING
app.post('/api/submit-booking', async (req, res) => {
    try {
        await new Booking(req.body).save();
        res.status(201).json({ success: true, message: "Booking received successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error submitting booking", error: err.message });
    }
});

// CONTACT
app.post('/api/submit-contact', async (req, res) => {
    try {
        await new Contact(req.body).save();
        res.status(201).json({ success: true, message: "Message sent successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error sending message", error: err.message });
    }
});

// AFFILIATE
app.post('/api/submit-affiliate', async (req, res) => {
    try {
        await new Affiliate(req.body).save();
        res.status(201).json({ success: true, message: "Affiliate application received" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error submitting application", error: err.message });
    }
});

// FEEDBACK
app.post('/api/submit-feedback', async (req, res) => {
    try {
        await new Feedback(req.body).save();
        res.status(201).json({ success: true, message: "Feedback saved successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error saving feedback", error: err.message });
    }
});

// Catch-all to prevent HTML responses when API endpoints are missing
app.use((req, res) => {
    res.status(404).json({ success: false, message: "API endpoint not found" });
});

module.exports = app;
