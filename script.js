document.addEventListener('DOMContentLoaded', () => {

    // 1. Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => { navLinks.classList.toggle('active'); });
    }

    // 2. Animated Statistics Counters
    const counters = document.querySelectorAll('.counter-value');
    if(counters.length > 0) {
        const observeCounters = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const updateCount = () => {
                        const target = +counter.getAttribute('data-target');
                        const count = +counter.innerText;
                        const inc = target / 200;
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

    // 3. FAQ Accordion Logic
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
                        if(faq.querySelector('.fas')) faq.querySelector('.fas').classList.replace('fa-minus', 'fa-plus');
                    }
                });

                parent.classList.toggle('active');
                const icon = item.querySelector('.fas');
                if (parent.classList.contains('active')) {
                    answer.style.maxHeight = answer.scrollHeight + "px";
                    if(icon) icon.classList.replace('fa-plus', 'fa-minus');
                } else {
                    answer.style.maxHeight = null;
                    if(icon) icon.classList.replace('fa-minus', 'fa-plus');
                }
            });
        });
    }

    // 4. Gallery Filtering System
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    if(filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active'); 
                const filterValue = btn.getAttribute('data-filter');
                galleryItems.forEach(item => {
                    if(filterValue === 'all' || item.classList.contains(filterValue)) item.classList.add('show');
                    else item.classList.remove('show');
                });
            });
        });
        const defaultFilter = document.querySelector('.filter-btn[data-filter="all"]');
        if(defaultFilter) defaultFilter.click();
    }

    // 5. Gallery Read More / Read Less Toggle
    const readMoreBtns = document.querySelectorAll('.read-more-btn');
    if (readMoreBtns.length > 0) {
        readMoreBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const moreText = this.parentElement.querySelector('.more-text');
                if (moreText.classList.contains('show')) {
                    moreText.classList.remove('show');
                    this.innerText = 'Read More';
                } else {
                    moreText.classList.add('show');
                    this.innerText = 'Read Less';
                }
            });
        });
    }

    // 6. Interactive Star Rating & REAL API Feedback Form 
    const stars = document.querySelectorAll('.star-rating .fa-star');
    const ratingValue = document.getElementById('ratingValue');
    if (stars.length > 0) {
        stars.forEach(star => {
            star.addEventListener('click', function() {
                let value = this.getAttribute('data-val');
                ratingValue.value = value;
                stars.forEach(s => s.classList.remove('active'));
                stars.forEach(s => { if (s.getAttribute('data-val') <= value) s.classList.add('active'); });
            });
        });
    }

    const feedbackForm = document.getElementById('feedbackForm');
    const feedbackSuccess = document.getElementById('feedbackSuccess');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!ratingValue.value) return alert("Please select a star rating!");

            const submitBtn = feedbackForm.querySelector('button[type="submit"]');
            submitBtn.innerText = 'Submitting...';
            submitBtn.disabled = true;

            const data = Object.fromEntries(new FormData(feedbackForm));

            try {
                const res = await fetch('/api/submit-feedback', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
                });
                const result = await res.json();
                
                if (res.ok && result.success) {
                    feedbackForm.style.display = 'none';
                    feedbackSuccess.style.display = 'block';
                } else throw new Error(result.message);
            } catch (err) {
                alert(err.message || "Failed to submit feedback. Try again.");
                submitBtn.innerText = 'Submit Feedback';
                submitBtn.disabled = false;
            }
        });
    }

    // 7. REAL API Authentication (Login/Register Forms)
    const togglePasswords = document.querySelectorAll('.toggle-password');
    if(togglePasswords.length > 0) {
        togglePasswords.forEach(icon => {
            icon.addEventListener('click', function() {
                const input = this.previousElementSibling;
                if(input.type === 'password') { input.type = 'text'; this.classList.replace('fa-eye', 'fa-eye-slash'); } 
                else { input.type = 'password'; this.classList.replace('fa-eye-slash', 'fa-eye'); }
            });
        });
    }

    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    if(phoneInputs.length > 0) {
        phoneInputs.forEach(input => {
            input.addEventListener('input', function() {
                const isValid = /^\+2519\d{8}$/.test(this.value);
                const errorMsg = this.nextElementSibling;
                if(this.value.length > 0) {
                    this.style.borderColor = isValid ? '#2e7d32' : 'red';
                    if(errorMsg && errorMsg.classList.contains('phone-error')) errorMsg.style.display = isValid ? 'none' : 'block';
                } else {
                    this.style.borderColor = '#ddd';
                    if(errorMsg && errorMsg.classList.contains('phone-error')) errorMsg.style.display = 'none';
                }
            });
        });
    }

    const loginForm = document.getElementById('loginForm');
    if(loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const phone = document.getElementById('login_phone').value;
            if(!/^\+2519\d{8}$/.test(phone)) return alert('Please enter a valid Ethiopian phone number (+2519...)');
            
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            submitBtn.innerText = 'Verifying...';
            submitBtn.disabled = true;

            const data = Object.fromEntries(new FormData(loginForm));
            try {
                const res = await fetch('/api/login', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
                });
                const result = await res.json();

                if (res.ok && result.success) {
                    localStorage.setItem('jafe_logged_in', 'true');
                    window.location.href = 'booking.html';
                } else throw new Error(result.message);
            } catch (err) {
                alert(err.message || 'Invalid phone number or password.');
                submitBtn.innerText = 'Secure Login';
                submitBtn.disabled = false;
            }
        });
    }

    const registerForm = document.getElementById('registerForm');
    if(registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const phone = document.getElementById('reg_phone').value;
            if(!/^\+2519\d{8}$/.test(phone)) return alert('Please enter a valid Ethiopian phone number (+2519...)');
            
            const submitBtn = registerForm.querySelector('button[type="submit"]');
            submitBtn.innerText = 'Creating Account...';
            submitBtn.disabled = true;

            const data = Object.fromEntries(new FormData(registerForm));
            try {
                const res = await fetch('/api/register', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
                });
                const result = await res.json();

                if (res.ok && result.success) {
                    localStorage.setItem('jafe_logged_in', 'true');
                    window.location.href = 'booking.html';
                } else throw new Error(result.message);
            } catch (err) {
                alert(err.message || 'Error creating account. Phone might be registered already.');
                submitBtn.innerText = 'Register & Proceed';
                submitBtn.disabled = false;
            }
        });
    }

    // 8. REAL API Booking Form Logic & Auth Protection
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        const isLoggedIn = localStorage.getItem('jafe_logged_in') === 'true';
        if(!isLoggedIn) {
            const container = bookingForm.parentElement;
            container.innerHTML = `
                <div style="text-align: center; padding: 50px 20px; background: #fff; border-radius: 8px; border-left: 5px solid var(--brand-red); box-shadow: 0 5px 15px rgba(0,0,0,0.05);">
                    <i class="fas fa-lock" style="font-size: 50px; color: #888; margin-bottom: 20px;"></i>
                    <h3 style="font-size: 24px; margin-bottom: 15px;">Authentication Required</h3>
                    <p style="color: #555; margin-bottom: 30px;">You must have a registered account to book an event with Jafe Decor.</p>
                    <div>
                        <a href="login.html" class="btn btn-primary" style="margin: 5px;">Secure Login</a>
                        <a href="register.html" class="btn btn-outline" style="margin: 5px; border: 1px solid var(--brand-red); color: var(--brand-red); padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: 600; display: inline-block;">Register Account</a>
                    </div>
                </div>
            `;
        } else {
            const dateInput = document.getElementById('date');
            if (dateInput) {
                const today = new Date();
                dateInput.min = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            }

            const successMessage = document.getElementById('successMessage');
            const submitBtn = document.getElementById('submitBtn');

            bookingForm.addEventListener('submit', async function(e) {
                e.preventDefault(); 
                submitBtn.innerText = 'Connecting to Server...';
                submitBtn.style.opacity = '0.7'; submitBtn.style.cursor = 'not-allowed'; submitBtn.disabled = true;

                const data = Object.fromEntries(new FormData(bookingForm));
                try {
                    const res = await fetch('/api/submit-booking', {
                        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
                    });
                    const result = await res.json();

                    if (res.ok && result.success) {
                        bookingForm.style.display = 'none';
                        if(successMessage) {
                            successMessage.style.display = 'block';
                            successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    } else throw new Error(result.message);
                } catch (err) {
                    alert(err.message || 'Error processing request.');
                    submitBtn.innerText = 'Submit Booking Request';
                    submitBtn.style.opacity = '1'; submitBtn.style.cursor = 'pointer'; submitBtn.disabled = false;
                }
            });
        }
    }

    // 9. REAL API General Forms (Contact & Affiliate)
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = 'Sending...'; submitBtn.disabled = true;

            const data = Object.fromEntries(new FormData(contactForm));
            try {
                const res = await fetch('/api/submit-contact', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
                });
                
                if (res.ok) {
                    contactForm.style.display = 'none';
                    const contactSuccessBox = document.createElement('div');
                    contactSuccessBox.className = 'success-box';
                    contactSuccessBox.style.cssText = 'padding: 40px 20px; text-align: center; border: 1px solid #ddd; border-radius: 8px; background-color: #fcfcfc; animation: fadeIn 0.5s ease-in-out;';
                    contactSuccessBox.innerHTML = `
                        <i class="fas fa-paper-plane" style="font-size: 50px; color: var(--brand-red); margin-bottom: 20px;"></i>
                        <h3 style="color: var(--bg-dark); margin-bottom: 15px; font-size: 24px;">Message Sent Successfully!</h3>
                        <p style="color: #555; font-size: 16px;">We have received your message and will contact you very soon.</p>`;
                    contactForm.parentNode.appendChild(contactSuccessBox);
                } else throw new Error();
            } catch (err) {
                alert('Network Error. Please try again.');
                submitBtn.innerHTML = originalText; submitBtn.disabled = false;
            }
        });
    }

    const affiliateForm = document.getElementById('affiliateForm'); 
    if (affiliateForm) {
        affiliateForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const submitBtn = affiliateForm.querySelector('button[type="submit"]');
            submitBtn.innerText = 'Applying...'; submitBtn.disabled = true;

            const data = Object.fromEntries(new FormData(affiliateForm));
            try {
                const res = await fetch('/api/submit-affiliate', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
                });
                
                if (res.ok) {
                    affiliateForm.style.display = 'none';
                    const affiliateSuccessBox = document.createElement('div');
                    affiliateSuccessBox.className = 'success-box';
                    affiliateSuccessBox.style.cssText = 'border: 3px solid var(--brand-red); padding: 40px 20px; text-align: center; border-radius: 8px; background-color: #fffafa; animation: fadeIn 0.5s ease-in-out;';
                    affiliateSuccessBox.innerHTML = `
                        <h3 style="color: var(--brand-red); margin-bottom: 15px; font-size: 28px; font-weight: 700;">Congratulations! 🎊</h3>
                        <p style="color: #333; font-size: 16px; margin-bottom: 20px;">Your affiliate application has been successfully submitted. Welcome to the Jafe Decor family!</p>
                        <p style="color: #555; font-size: 15px;">Our team will send your personalized onboarding packet to your email shortly.</p>`;
                    affiliateForm.parentNode.appendChild(affiliateSuccessBox);
                } else throw new Error();
            } catch (err) {
                alert('Network Error. Please try again.');
                submitBtn.innerText = 'Apply Now'; submitBtn.disabled = false;
            }
        });
    }
});
