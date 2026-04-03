document.addEventListener('DOMContentLoaded', () => {
    // UI UTILITIES
    function showCustomAlert(message, type = 'success', callback = null) {
        const overlay = document.createElement('div');
        overlay.className = 'custom-alert-overlay';
        const box = document.createElement('div');
        box.className = 'custom-alert-box';
        let icon = type === 'success' ? '<i class="fa-solid fa-circle-check" style="color: #2ecc71; font-size: 3rem; margin-bottom: 15px;"></i>' : '<i class="fa-solid fa-circle-xmark" style="color: #e74c3c; font-size: 3rem; margin-bottom: 15px;"></i>';
        box.innerHTML = `${icon}<p style="margin-bottom:20px; font-size:1.1rem;">${message}</p>`;
        const btn = document.createElement('button');
        btn.className = 'btn'; btn.style.width = '100%'; btn.innerText = 'OK';
        btn.onclick = () => { overlay.remove(); if (callback) callback(); };
        box.appendChild(btn); overlay.appendChild(box); document.body.appendChild(overlay);
    }

    // TELEGRAM WIDGET
    const telegramWidget = document.createElement('a');
    telegramWidget.href = "https://t.me/UrjiiSupport";
    telegramWidget.target = "_blank";
    telegramWidget.className = "telegram-widget";
    telegramWidget.innerHTML = `<i class="fa-brands fa-telegram"></i> <span>Telegram Support</span>`;
    document.body.appendChild(telegramWidget);

    // THEME & NAV
    const themeToggle = document.querySelector('.theme-toggle');
    if (localStorage.getItem('theme') === 'dark') { document.body.classList.add('dark-mode'); if(themeToggle) themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>'; }
    if(themeToggle) themeToggle.addEventListener('click', () => { 
        document.body.classList.toggle('dark-mode'); 
        localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light'); 
        themeToggle.innerHTML = document.body.classList.contains('dark-mode') ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>'; 
    });

    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    if(hamburger) hamburger.addEventListener('click', () => { navLinks.classList.toggle('active'); hamburger.classList.toggle('fa-bars'); hamburger.classList.toggle('fa-times'); });

    const hiddenElements = document.querySelectorAll('.hidden');
    const observer = new IntersectionObserver((entries) => { entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('show'); }); }, { threshold: 0.1 });
    hiddenElements.forEach(el => observer.observe(el));

    // DYNAMIC HEADER AUTH
    const authHeaderActions = document.getElementById('authHeaderActions');
    const isLoggedIn = localStorage.getItem('urjii_is_logged_in') === 'true';
    const savedUser = JSON.parse(localStorage.getItem('urjii_user'));
    if (authHeaderActions) {
        if (isLoggedIn && savedUser) {
            authHeaderActions.innerHTML = `<a href="profile.html" class="btn" style="background: transparent; border: 1px solid var(--primary-color); color: var(--primary-color);"><i class="fa-solid fa-user-circle"></i> Profile</a>`;
        } else {
            authHeaderActions.innerHTML = `<a href="Auth.html" class="btn" style="background: transparent; border: 1px solid var(--primary-color); color: var(--primary-color);">Login</a>`;
        }
    }

    // INTERNATIONAL DATA
    const countriesData = [
        { name: "Ethiopia", code: "+251", flag: "🇪🇹", min: 9, max: 9 }, { name: "Kenya", code: "+254", flag: "🇰🇪", min: 9, max: 10 },
        { name: "Uganda", code: "+256", flag: "🇺🇬", min: 9, max: 9 }, { name: "Tanzania", code: "+255", flag: "🇹🇿", min: 9, max: 9 },
        { name: "Rwanda", code: "+250", flag: "🇷🇼", min: 9, max: 9 }, { name: "Burundi", code: "+257", flag: "🇧🇮", min: 8, max: 8 },
        { name: "Somalia", code: "+252", flag: "🇸🇴", min: 8, max: 9 }, { name: "Eritrea", code: "+291", flag: "🇪🇷", min: 7, max: 7 },
        { name: "Djibouti", code: "+253", flag: "🇩🇯", min: 8, max: 8 }, { name: "South Sudan", code: "+211", flag: "🇸🇸", min: 9, max: 9 },
        { name: "USA", code: "+1", flag: "🇺🇸", min: 10, max: 10 }, { name: "Canada", code: "+1", flag: "🇨🇦", min: 10, max: 10 },
        { name: "UK", code: "+44", flag: "🇬🇧", min: 10, max: 10 }, { name: "UAE", code: "+971", flag: "🇦🇪", min: 9, max: 9 },
        { name: "India", code: "+91", flag: "🇮🇳", min: 10, max: 10 }, { name: "Australia", code: "+61", flag: "🇦🇺", min: 9, max: 9 },
        { name: "Germany", code: "+49", flag: "🇩🇪", min: 10, max: 11 }, { name: "France", code: "+33", flag: "🇫🇷", min: 9, max: 9 },
        { name: "China", code: "+86", flag: "🇨🇳", min: 11, max: 11 }, { name: "Japan", code: "+81", flag: "🇯🇵", min: 10, max: 10 },
        { name: "Brazil", code: "+55", flag: "🇧🇷", min: 10, max: 11 }, { name: "South Africa", code: "+27", flag: "🇿🇦", min: 9, max: 9 },
        { name: "Nigeria", code: "+234", flag: "🇳🇬", min: 10, max: 10 }, { name: "Egypt", code: "+20", flag: "🇪🇬", min: 10, max: 10 },
        { name: "Saudi Arabia", code: "+966", flag: "🇸🇦", min: 9, max: 9 }
    ];

    function populateCountrySelects() {
        const countrySelects = document.querySelectorAll('.dynamic-country');
        const phoneCodeSelects = document.querySelectorAll('.dynamic-phone-code');
        
        countrySelects.forEach(select => {
            select.innerHTML = '<option value="">Select Country</option>';
            countriesData.forEach(c => {
                let opt = document.createElement('option');
                opt.value = c.name; opt.textContent = `${c.flag} ${c.name}`;
                if(c.name === "Ethiopia") opt.selected = true;
                select.appendChild(opt);
            });
        });

        phoneCodeSelects.forEach(select => {
            select.innerHTML = '';
            countriesData.forEach(c => {
                let opt = document.createElement('option');
                opt.value = c.code; opt.dataset.min = c.min; opt.dataset.max = c.max;
                opt.textContent = `${c.flag} ${c.code}`;
                if(c.name === "Ethiopia") opt.selected = true;
                select.appendChild(opt);
            });
        });

        countrySelects.forEach((select, index) => {
            select.addEventListener('change', (e) => {
                const selectedCountry = countriesData.find(c => c.name === e.target.value);
                if(selectedCountry && phoneCodeSelects[index]) {
                    phoneCodeSelects[index].value = selectedCountry.code;
                }
            });
        });
    }
    populateCountrySelects();

    // AUTH FORMS
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const showRegBtn = document.getElementById('showRegisterBtn');
    const showLoginBtn = document.getElementById('showLoginBtn');

    if(showRegBtn) showRegBtn.addEventListener('click', () => { loginForm.style.display='none'; registerForm.style.display='block'; showRegBtn.style.background='var(--primary-color)'; showRegBtn.style.color='#fff'; showLoginBtn.style.background='transparent'; showLoginBtn.style.color='var(--text-light)'; });
    if(showLoginBtn) showLoginBtn.addEventListener('click', () => { registerForm.style.display='none'; loginForm.style.display='block'; showLoginBtn.style.background='var(--primary-color)'; showLoginBtn.style.color='#fff'; showRegBtn.style.background='transparent'; showRegBtn.style.color='var(--text-light)'; });

    document.querySelectorAll('.toggle-password').forEach(icon => {
        icon.addEventListener('click', function() {
            const input = this.previousElementSibling;
            if (input.type === 'password') { input.type = 'text'; this.classList.replace('fa-eye', 'fa-eye-slash'); } 
            else { input.type = 'password'; this.classList.replace('fa-eye-slash', 'fa-eye'); }
        });
    });

    if(registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const pass = document.getElementById('regPassword').value;
            const confirmPass = document.getElementById('regConfirmPassword').value;
            if(pass !== confirmPass) { showCustomAlert("Passwords do not match!", "error"); return; }
            if(!document.getElementById('termsAgree').checked) { showCustomAlert("You must agree to the terms.", "error"); return; }

            const phoneSelect = document.getElementById('regPhoneCode');
            const phoneInput = document.getElementById('regPhoneNum').value;
            const selectedOpt = phoneSelect.options[phoneSelect.selectedIndex];
            
            if(phoneInput.length < selectedOpt.dataset.min || phoneInput.length > selectedOpt.dataset.max) {
                showCustomAlert(`Phone length for ${selectedOpt.value} must be ${selectedOpt.dataset.min}-${selectedOpt.dataset.max} digits.`, "error"); return;
            }

            const user = {
                firstName: document.getElementById('regFirstName').value, lastName: document.getElementById('regLastName').value,
                email: document.getElementById('regEmail').value, fullPhone: selectedOpt.value + phoneInput, password: pass
            };
            localStorage.setItem('urjii_user', JSON.stringify(user));
            showCustomAlert("Registered successfully! You can now log in.", "success", () => showLoginBtn.click());
        });
    }

    if(loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('loginIdentifier').value.trim();
            const pass = document.getElementById('loginPassword').value;
            
            if(savedUser && (id === savedUser.email || id === savedUser.fullPhone || id === savedUser.fullPhone.replace('+','')) && pass === savedUser.password) {
                localStorage.setItem('urjii_is_logged_in', 'true');
                window.location.href = "profile.html";
            } else { document.getElementById('loginError').style.display = 'block'; }
        });
    }

    // ORDER FORM VALIDATION
    const orderForm = document.getElementById('orderForm');
    if(orderForm) {
        orderForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const phoneSelect = document.getElementById('orderPhoneCode');
            const phoneInput = document.getElementById('orderPhoneNum').value;
            const selectedOpt = phoneSelect.options[phoneSelect.selectedIndex];
            if(phoneInput.length < selectedOpt.dataset.min || phoneInput.length > selectedOpt.dataset.max) {
                document.getElementById('phoneError').innerText = `Require ${selectedOpt.dataset.min}-${selectedOpt.dataset.max} digits.`;
                document.getElementById('phoneError').style.display = 'block'; return;
            }
            document.getElementById('phoneError').style.display = 'none';
            const btn = document.getElementById('orderSubmitBtn'); btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...'; btn.disabled = true;
            setTimeout(() => { showCustomAlert('Order submitted successfully!', 'success', () => window.location.href="profile.html"); }, 1500);
        });
    }

    // PROFILE DASHBOARD & SKELETON
    if(window.location.pathname.includes('profile.html')) {
        if(!isLoggedIn) { window.location.href="Auth.html"; return; }
        document.getElementById('displayUserName').innerText = `${savedUser.firstName} ${savedUser.lastName}`;
        const ordersContainer = document.getElementById('ordersContainer');
        // Inject Skeleton
        ordersContainer.innerHTML = `
            <div class="skeleton-box skeleton"></div>
            <div class="skeleton-box skeleton"></div>
        `;
        setTimeout(() => {
            ordersContainer.innerHTML = `
                <div class="card" style="border-left: 4px solid var(--primary-color); text-align:left; padding:20px; margin-bottom:15px;">
                    <div style="display:flex; justify-content: space-between; align-items: center;">
                        <div><span style="font-size: 0.8rem; color: #888;">ORD-1029</span><h4 style="margin-top: 5px;">E-Commerce Platform</h4></div>
                        <span style="background: rgba(201, 160, 99, 0.2); color: var(--primary-color); padding: 4px 10px; border-radius: 4px; font-size:0.8rem; font-weight: 500;">In Development</span>
                    </div>
                </div>`;
        }, 2000);

        document.getElementById('sidebarLogoutBtn').addEventListener('click', () => { localStorage.removeItem('urjii_is_logged_in'); window.location.href="index.html"; });
    }

    // REVIEW SYSTEM
    const reviewForm = document.getElementById('reviewForm');
    const reviewsContainer = document.getElementById('reviewsContainer');
    let currentRating = 5;

    document.querySelectorAll('.star-rating i').forEach(star => {
        star.addEventListener('click', (e) => {
            currentRating = e.target.getAttribute('data-val');
            document.querySelectorAll('.star-rating i').forEach(s => s.classList.remove('active'));
            e.target.classList.add('active');
        });
    });

    function loadReviews() {
        if(!reviewsContainer) return;
        const reviews = JSON.parse(localStorage.getItem('urjii_reviews')) || [
            { name: "Tech Corp Addis", rating: 5, text: "Urjii completely transformed our digital workflow. Their attention to detail is unmatched." },
            { name: "Delivery Solutions", rating: 5, text: "The app they built for us has over 10k downloads. Fast, reliable, and user-friendly." }
        ];
        reviewsContainer.innerHTML = '';
        reviews.forEach(r => {
            let stars = Array(parseInt(r.rating)).fill('<i class="fa-solid fa-star"></i>').join('');
            reviewsContainer.innerHTML += `
                <div class="card review-card">
                    <div class="stars">${stars}</div>
                    <p style="margin: 15px 0;">"${r.text}"</p>
                    <h4 style="color: var(--primary-color);">- ${r.name}</h4>
                </div>`;
        });
    }
    loadReviews();

    if(reviewForm) {
        reviewForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const reviews = JSON.parse(localStorage.getItem('urjii_reviews')) || [];
            reviews.unshift({ name: document.getElementById('revName').value, text: document.getElementById('revText').value, rating: currentRating });
            localStorage.setItem('urjii_reviews', JSON.stringify(reviews));
            reviewForm.reset(); loadReviews(); showCustomAlert("Review submitted successfully!", "success");
        });
    }

    // BLOG SEARCH
    const blogSearch = document.getElementById('blogSearch');
    if(blogSearch) {
        blogSearch.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            document.querySelectorAll('.blog-card').forEach(card => {
                card.style.display = card.innerText.toLowerCase().includes(term) ? 'block' : 'none';
            });
        });
    }
    
    
     // Setup Profile Tabs Logic
            const tabLinks = document.querySelectorAll('.profile-sidebar a[data-tab]');
            const tabPanes = document.querySelectorAll('.tab-pane');
            
            tabLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    const targetId = e.target.getAttribute('data-tab');
                    if(!targetId) return;
                    
                    // Remove active from all tabs
                    tabLinks.forEach(t => t.classList.remove('active'));
                    tabPanes.forEach(p => p.classList.remove('active'));
                    
                    // Add active to clicked tab
                    e.target.classList.add('active');
                    document.getElementById(targetId).classList.add('active');
                });
            });

            // Affiliate Copy Link Logic
            const copyBtn = document.getElementById('copyRefBtn');
            if(copyBtn) {
                copyBtn.addEventListener('click', () => {
                    const refInput = document.getElementById('refLinkInput');
                    refInput.select();
                    document.execCommand("copy");
                    
                    // Temporary toast style alert (requires global script alert function)
                    if(typeof showCustomAlert === "function") {
                        showCustomAlert("Referral Link Copied!", "success");
                    } else {
                        alert("Referral Link Copied!");
                    }
                });
            }

            // Forms Submit mock actions
            document.getElementById('profileForm').addEventListener('submit', (e) => {
                e.preventDefault();
                alert("Profile Updated Successfully!");
            });
            document.getElementById('passwordForm').addEventListener('submit', (e) => {
                e.preventDefault();
                alert("Password Updated Successfully!");
                e.target.reset();
            });
            document.getElementById('settingsForm').addEventListener('submit', (e) => {
                e.preventDefault();
                alert("Settings Saved!");
            });
    
});

        
           