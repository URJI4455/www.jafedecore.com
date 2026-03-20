

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
                        // Calculate increment
                        const inc = target / speed;
                        
                        if (count < target) {
                            counter.innerText = Math.ceil(count + inc);
                            setTimeout(updateCount, 15);
                        } else {
                            counter.innerText = target + '+';
                        }
                    };
                    updateCount();
                    observeCounters.unobserve(counter); // Stop observing once counted
                }
            });
        }, { threshold: 0.5 }); // Trigger when 50% visible
        
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
                
                // Close other open faqs
                document.querySelectorAll('.faq-item').forEach(faq => {
                    if(faq !== parent) {
                        faq.classList.remove('active');
                        faq.querySelector('.faq-answer').style.maxHeight = null;
                        if(faq.querySelector('.fas')) {
                            faq.querySelector('.fas').classList.replace('fa-minus', 'fa-plus');
                        }
                    }
                });

                // Toggle current FAQ
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

    // ==========================================
    // 4. Gallery Filtering System
    // ==========================================
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    if(filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active'); // Add to clicked button
                
                const filterValue = btn.getAttribute('data-filter');
                
                // Filter the gallery items
                galleryItems.forEach(item => {
                    if(filterValue === 'all' || item.classList.contains(filterValue)) {
                        item.classList.add('show');
                    } else {
                        item.classList.remove('show');
                    }
                });
            });
        });
        
        // Trigger default filter on page load
        const defaultFilter = document.querySelector('.filter-btn[data-filter="all"]');
        if(defaultFilter) defaultFilter.click();
    }

    // ==========================================
    // 5. Gallery Read More / Read Less Toggle
    // ==========================================
    const readMoreBtns = document.querySelectorAll('.read-more-btn');

    if (readMoreBtns.length > 0) {
        readMoreBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Find the hidden text span inside this specific card
                const cardContent = this.parentElement;
                const moreText = cardContent.querySelector('.more-text');

                // Toggle visibility
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

    // ==========================================
    // 6. Interactive Star Rating for Feedback Form
    // ==========================================
    const stars = document.querySelectorAll('.star-rating .fa-star');
    const ratingValue = document.getElementById('ratingValue');

    if (stars.length > 0) {
        stars.forEach(star => {
            star.addEventListener('click', function() {
                let value = this.getAttribute('data-val');
                ratingValue.value = value;
                
                stars.forEach(s => s.classList.remove('active'));
                
                stars.forEach(s => {
                    if (s.getAttribute('data-val') <= value) {
                        s.classList.add('active');
                    }
                });
            });
        });
    }

    // Feedback Form Submission
    const feedbackForm = document.getElementById('feedbackForm');
    const feedbackSuccess = document.getElementById('feedbackSuccess');

    if (feedbackForm) {
        feedbackForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!ratingValue.value) {
                alert("Please select a star rating!");
                return;
            }
            feedbackForm.style.display = 'none';
            feedbackSuccess.style.display = 'block';
        });
    }

    // ==========================================
    // 7. Authentication (Login/Register Forms)
    // ==========================================
    
    // Toggle Password Visibility
    const togglePasswords = document.querySelectorAll('.toggle-password');
    if(togglePasswords.length > 0) {
        togglePasswords.forEach(icon => {
            icon.addEventListener('click', function() {
                const input = this.previousElementSibling;
                if(input.type === 'password') {
                    input.type = 'text';
                    this.classList.replace('fa-eye', 'fa-eye-slash');
                } else {
                    input.type = 'password';
                    this.classList.replace('fa-eye-slash', 'fa-eye');
                }
            });
        });
    }

    // Validate Ethiopian Phone Numbers (+2519...)
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    if(phoneInputs.length > 0) {
        phoneInputs.forEach(input => {
            input.addEventListener('input', function() {
                const errorMsg = this.nextElementSibling;
                const isValid = /^\+2519\d{8}$/.test(this.value);
                
                if(this.value.length > 0) {
                    this.style.borderColor = isValid ? '#2e7d32' : 'red'; // Green if valid, Red if invalid
                    if(errorMsg && errorMsg.classList.contains('phone-error')) {
                        errorMsg.style.display = isValid ? 'none' : 'block';
                    }
                } else {
                    this.style.borderColor = '#ddd'; // Reset if empty
                    if(errorMsg && errorMsg.classList.contains('phone-error')) errorMsg.style.display = 'none';
                }
            });
        });
    }

    // Process Mock Login
    const loginForm = document.getElementById('loginForm');
    if(loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const phone = document.getElementById('login_phone').value;
            if(!/^\+2519\d{8}$/.test(phone)) {
                alert('Please enter a valid Ethiopian phone number (+2519...)');
                return;
            }
            // Mock Login: Set login state & redirect to booking
            localStorage.setItem('jafe_logged_in', 'true');
            window.location.href = 'booking.html';
        });
    }

    // Process Mock Register
    const registerForm = document.getElementById('registerForm');
    if(registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const phone = document.getElementById('reg_phone').value;
            if(!/^\+2519\d{8}$/.test(phone)) {
                alert('Please enter a valid Ethiopian phone number (+2519...)');
                return;
            }
            // Mock Register: Set login state & redirect to booking
            localStorage.setItem('jafe_logged_in', 'true');
            window.location.href = 'booking.html';
        });
    }

    // ==========================================
    // 8. Booking Form Logic & Auth Protection
    // ==========================================
    
    const bookingForm = document.getElementById('bookingForm');
    
    if (bookingForm) {
        // --- 8a. Check Authentication ---
        const isLoggedIn = localStorage.getItem('jafe_logged_in') === 'true';
        
        if(!isLoggedIn) {
            // Replace form with secure login prompt if not logged in
            const container = bookingForm.parentElement;
            container.innerHTML = `
                <div style="text-align: center; padding: 50px 20px; background: #fff; border-radius: 8px; border-left: 5px solid var(--brand-red); box-shadow: 0 5px 15px rgba(0,0,0,0.05);">
                    <i class="fas fa-lock" style="font-size: 50px; color: #888; margin-bottom: 20px;"></i>
                    <h3 style="font-size: 24px; margin-bottom: 15px;">Authentication Required</h3>
                    <p style="color: #555; margin-bottom: 30px;">You must have a registered account to book an event with Jafe Decor. Please log in or register to secure your date.</p>
                    <div>
                        <a href="login.html" class="btn btn-primary" style="margin: 5px;">Secure Login</a>
                        <a href="register.html" class="btn btn-outline" style="margin: 5px; border: 1px solid var(--brand-red); color: var(--brand-red); padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: 600; display: inline-block;">Register Account</a>
                    </div>
                </div>
            `;
        } else {
            // --- 8b. Date Validation (Prevent Past Dates) ---
            const dateInput = document.getElementById('date');
            if (dateInput) {
                const today = new Date();
                const yyyy = today.getFullYear();
                const mm = String(today.getMonth() + 1).padStart(2, '0');
                const dd = String(today.getDate()).padStart(2, '0');
                const formattedToday = `${yyyy}-${mm}-${dd}`;
                dateInput.min = formattedToday;
            }

            // --- 8c. Booking Form Submission Mock ---
            const successMessage = document.getElementById('successMessage');
            const submitBtn = document.getElementById('submitBtn');

            bookingForm.addEventListener('submit', function(e) {
                e.preventDefault(); 
                submitBtn.innerText = 'Processing Request...';
                submitBtn.style.opacity = '0.7';
                submitBtn.style.cursor = 'not-allowed';
                submitBtn.disabled = true;

                setTimeout(() => {
                    bookingForm.style.display = 'none';
                    if(successMessage) {
                        successMessage.style.display = 'block';
                        successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 1500); 
            });
        }
    }

    // ==========================================
    // 9. General Forms (Contact & Affiliate)
    // ==========================================
    
    // Contact Form Logic
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            contactForm.style.display = 'none';
            
            const contactSuccessBox = document.createElement('div');
            contactSuccessBox.className = 'success-box';
            contactSuccessBox.style.cssText = 'padding: 40px 20px; text-align: center; border: 1px solid #ddd; border-radius: 8px; background-color: #fcfcfc; animation: fadeIn 0.5s ease-in-out;';
            contactSuccessBox.innerHTML = `
                <i class="fas fa-paper-plane" style="font-size: 50px; color: var(--brand-red); margin-bottom: 20px;"></i>
                <h3 style="color: var(--bg-dark); margin-bottom: 15px; font-size: 24px;">Message Sent Successfully!</h3>
                <p style="color: #555; font-size: 16px; margin-bottom: 0;">Thank you for reaching out to Jafe Decor. We have received your message and one of our event specialists will contact you very soon.</p>
            `;
            contactForm.parentNode.appendChild(contactSuccessBox);
        });
    }

    // Affiliate Form Logic
    const affiliateForm = document.getElementById('affiliateForm'); 
    if (affiliateForm) {
        affiliateForm.addEventListener('submit', function(e) {
            e.preventDefault();
            affiliateForm.style.display = 'none';
            
            const affiliateSuccessBox = document.createElement('div');
            affiliateSuccessBox.className = 'success-box';
            affiliateSuccessBox.style.cssText = 'border: 3px solid var(--brand-red); padding: 40px 20px; text-align: center; border-radius: 8px; background-color: #fffafa; animation: fadeIn 0.5s ease-in-out;';
            affiliateSuccessBox.innerHTML = `
                <h3 style="color: var(--brand-red); margin-bottom: 15px; font-size: 28px; font-weight: 700;">Congratulations! 🎊</h3>
                <p style="color: #333; font-size: 16px; margin-bottom: 20px;">Your affiliate application has been successfully submitted. Welcome to the Jafe Decor family!</p>
                <p style="color: #555; font-size: 15px;">Our team will review your details and send your personalized onboarding packet and referral links to your email shortly.</p>
            `;
            affiliateForm.parentNode.appendChild(affiliateSuccessBox);
        });
    }

});

