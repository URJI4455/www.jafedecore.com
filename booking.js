const mongoose = require('mongoose');

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

const contactSchema = new mongoose.Schema({
    contact_name: { type: String, required: true },
    contact_email: { type: String, required: true },
    message: { type: String, required: true }
}, { timestamps: true });

const affiliateSchema = new mongoose.Schema({
    aff_name: { type: String, required: true },
    company: { type: String },
    aff_email: { type: String, required: true },
    promo_method: { type: String, required: true }
}, { timestamps: true });

const feedbackSchema = new mongoose.Schema({
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    feedback: { type: String, required: true }
}, { timestamps: true });

module.exports = {
    Booking: mongoose.model('Booking', bookingSchema),
    Contact: mongoose.model('Contact', contactSchema),
    Affiliate: mongoose.model('Affiliate', affiliateSchema),
    Feedback: mongoose.model('Feedback', feedbackSchema)
};