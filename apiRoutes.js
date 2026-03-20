const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

// Import your Blueprints (Models)
const User = require('../models/User');
const { Booking, Contact, Affiliate, Feedback } = require('../models/Booking');

// Ping Route
router.get('/ping', (req, res) => res.status(200).json({ message: "Server is awake!" }));

// 1. REGISTER
router.post('/register', async (req, res) => {
    try {
        const existingUser = await User.findOne({ phone: req.body.phone });
        if (existingUser) return res.status(400).json({ success: false, message: "Phone already registered." });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const newUser = new User({ ...req.body, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ success: true, message: "Registration successful" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error", error: err.message });
    }
});

// 2. LOGIN
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ phone: req.body.phone });
        if (!user) return res.status(401).json({ success: false, message: "Invalid credentials." });

        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (isMatch) res.status(200).json({ success: true, message: "Login successful" });
        else res.status(401).json({ success: false, message: "Invalid credentials." });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error", error: err.message });
    }
});

// 3. BOOKING
router.post('/submit-booking', async (req, res) => {
    try {
        await new Booking(req.body).save();
        res.status(201).json({ success: true, message: "Booking received" });
    } catch (err) { res.status(500).json({ success: false }); }
});

// 4. CONTACT
router.post('/submit-contact', async (req, res) => {
    try {
        await new Contact(req.body).save();
        res.status(201).json({ success: true, message: "Message sent" });
    } catch (err) { res.status(500).json({ success: false }); }
});

// 5. AFFILIATE & FEEDBACK
router.post('/submit-affiliate', async (req, res) => {
    try {
        await new Affiliate(req.body).save();
        res.status(201).json({ success: true });
    } catch (err) { res.status(500).json({ success: false }); }
});

router.post('/submit-feedback', async (req, res) => {
    try {
        await new Feedback(req.body).save();
        res.status(201).json({ success: true });
    } catch (err) { res.status(500).json({ success: false }); }
});

module.exports = router;