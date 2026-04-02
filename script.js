document.addEventListener('DOMContentLoaded', () => {

    // 1. Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('fa-bars');
        hamburger.classList.toggle('fa-times');
    });

    // 2. Light/Dark Mode Toggle
    const themeToggle = document.querySelector('.theme-toggle');
    const body = document.body;

    // Check local storage for theme
    if (localStorage.getItem('theme') === 'dark') {
        body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }

    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        if (body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
            themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
        } else {
            localStorage.setItem('theme', 'light');
            themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
        }
    });

    // 3. Scroll Animations (Intersection Observer)
    const hiddenElements = document.querySelectorAll('.hidden');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
            }
        });
    }, { threshold: 0.1 });

    hiddenElements.forEach((el) => observer.observe(el));

    // 4. Language Switcher (Simulation)
    const langToggle = document.querySelector('.lang-toggle');
    const langs = ['EN', 'AM', 'OR'];
    let currentLang = 0;

    langToggle.addEventListener('click', () => {
        currentLang = (currentLang + 1) % langs.length;
        langToggle.innerHTML = `<i class="fa-solid fa-globe"></i> ${langs[currentLang]}`;
        // In a real app, this would trigger content replacement or translation logic
    });

    // 5. Order Form Validation
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            let isValid = true;

            // Phone Validation (+251 followed by 9 or 7 and 8 digits)
            const phoneInput = document.getElementById('phone');
            const phoneError = document.getElementById('phoneError');
            const phoneRegex = /^(\+251)[9|7]\d{8}$/;

            if (!phoneRegex.test(phoneInput.value)) {
                phoneError.style.display = 'block';
                phoneError.innerText = "Please enter valid format: +2519XXXXXXXX or +2517XXXXXXXX";
                isValid = false;
            } else {
                phoneError.style.display = 'none';
            }

            // If valid, simulate submission
            if (isValid) {
                alert('Order submitted successfully! We will contact you soon.');
                orderForm.reset();
                
                // 6. Contact Form Validation
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            let isValid = true;

            // Simple Email Regex Validation
            const emailInput = document.getElementById('contactEmail');
            const emailError = document.getElementById('contactEmailError');
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(emailInput.value)) {
                emailError.style.display = 'block';
                isValid = false;
            } else {
                emailError.style.display = 'none';
            }

            // If valid, simulate message sending
            if (isValid) {
                // Change button text to show loading state
                const btn = contactForm.querySelector('button');
                const originalText = btn.innerText;
                btn.innerText = 'Sending...';
                
                setTimeout(() => {
                    alert('Thank you! Your message has been sent successfully.');
                    contactForm.reset();
                    btn.innerText = originalText;
                }, 1000); // Simulated 1 second delay
            }
        });
    }
            }
        });
    }
});