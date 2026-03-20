/**
 * JAFE DECOR - Official Script
 * Updated: March 2026
 * Backend: Vercel (MongoDB Atlas)
 */

const API_BASE_URL = 'https://jafedecore.vercel.app';

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. Mobile Menu Toggle
    // ==========================================
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // ==========================================
    // 2. Animated Statistics Counters
    // ==========================================
    const counters = document.querySelectorAll('.counter-value');
    const speed = 200; 
    
    if(counters.length > 0) {
        const observeCounters = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const updateCount = () => {
                        const target = +counter.getAttribute('data-target');
                        const count = +counter.innerText;
                        const inc = target / speed;
                        
                        if (count < target) {
                            counter.innerText = Math.ceil(count + inc);
                            setTimeout(updateCount, 15);
                        } else {
                            counter.innerText = target + '+';
                        }
                    };
                    updateCount();
                    observeCounters.unobserve(counter);
                }
            });
        }, { threshold: 0.5 });
        
        counters.forEach(c => observeCounters.observe(c));
    }

    // ==========================================
    // 3. FAQ Accordion Logic
    // ==========================================
    const faqItems = document.querySelectorAll('.faq-question');
    if(faqItems.length > 0) {
        faqItems.forEach(item => {
            item.addEventListener('click', () => {
                const parent = item.parentElement;
                const answer = item.nextElementSibling;
                document.querySelectorAll('.faq-item').forEach(faq => {
                    if(faq !== parent) {
                        faq.classList.remove('active');
                        faq.querySelector('.faq-answer').style.maxHeight = null;
                    }
                });
                parent.classList.toggle('active');
                answer.style.maxHeight = parent.classList.contains('active') ? answer.scrollHeight + "px" : null;
            });
        });
    }

    // ==========================================
    // 4. Gallery & Read More
    // ==========================================
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    if(filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const filterValue = btn.getAttribute('data-filter');
                galleryItems.forEach(item => {
                    item.classList.toggle('show', filterValue === 'all' || item.classList.contains(filterValue));
                });
            });
        });
    }

    const readMoreBtns = document.querySelectorAll('.read-more-btn');
    readMoreBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const moreText = this.parentElement.querySelector('.more-text');
            moreText.classList.toggle('show');
            this.innerText = moreText.classList.contains('show') ? 'Read Less' : 'Read More';
        });
    });

    // ==========================================
    // 5. Star Rating Logic
    // ==========================================
    const stars = document.querySelectorAll('.star-rating .fa-star');
    const ratingValue = document.getElementById('ratingValue');

    stars.forEach(star => {
        star.addEventListener('click', function() {
            let val = this.getAttribute('data-val');
            ratingValue.value = val;
            stars.forEach(s => s.classList.toggle('active', s.getAttribute('data-val') <= val));
        });
    });

    // ==========================================
    // 6. REAL DATA SUBMISSIONS (API FETCH)
    // ==========================================

    // Helper function for reusable Fetch logic
    async function postData(endpoint, data, formElement, successElement) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                formElement.style.display = 'none';
                if(successElement) successElement.style.display = 'block';
                return true;
            } else {
                const err = await response.json();
                alert("Error: " + (err.message || "Submission failed"));
            }
        } catch (error) {
            console.error("Fetch Error:", error);
            alert("Server connection failed. Is your Vercel backend live?");
        }
        return false;
    }

    // FEEDBACK SUBMISSION
    const feedbackForm = document.getElementById('feedbackForm');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                rating: document.getElementById('ratingValue').value,
                comment: feedbackForm.querySelector('textarea').value
            };
            await postData('/api/feedback', data, feedbackForm, document.getElementById('feedbackSuccess'));
        });
    }

    // CONTACT SUBMISSION
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                name: contactForm.querySelector('[name="name"]').value,
                email: contactForm.querySelector('[name="email"]').value,
                message: contactForm.querySelector('[name="message"]').value
            };
            await postData('/api/contact', data, contactForm, null); // Add custom success box logic if needed
        });
    }

    // AFFILIATE SUBMISSION
    const affiliateForm = document.getElementById('affiliateForm');
    if (affiliateForm) {
        affiliateForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                full_name: affiliateForm.querySelector('[name="full_name"]').value,
                phone: affiliateForm.querySelector('[name="phone"]').value,
                social_link: affiliateForm.querySelector('[name="social_link"]').value
            };
            await postData('/api/affiliate', data, affiliateForm, null);
        });
    }

    // LOGIN SUBMISSION
    const loginForm = document.getElementById('loginForm');
    if(loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const phone = document.getElementById('login_phone').value;
            const password = document.getElementById('login_password')?.value;

            const response = await fetch(`${API_BASE_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, password })
            });

            if(response.ok) {
                localStorage.setItem('jafe_logged_in', 'true');
                window.location.href = 'booking.html';
            } else {
                alert("Invalid Login. Please register if you don't have an account.");
            }
        });
    }

    // BOOKING SUBMISSION
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        const isLoggedIn = localStorage.getItem('jafe_logged_in') === 'true';
        if(!isLoggedIn) {
            bookingForm.parentElement.innerHTML = `<div class="auth-notice"><h3>Please Login to Book</h3><a href="login.html" class="btn">Login Now</a></div>`;
        } else {
            bookingForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                const submitBtn = document.getElementById('submitBtn');
                submitBtn.innerText = 'Processing...';

                const data = {
                    name: document.getElementById('name').value,
                    phone: document.getElementById('phone').value,
                    event_type: document.getElementById('event_type').value,
                    date: document.getElementById('date').value,
                    message: document.getElementById('message').value
                };

                const success = await postData('/api/booking', data, bookingForm, document.getElementById('successMessage'));
                if(!success) submitBtn.innerText = 'Submit Booking';
            });
        }
    }
});
