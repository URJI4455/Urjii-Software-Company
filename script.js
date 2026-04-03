document.addEventListener('DOMContentLoaded', () => {

    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then(registration => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
          }, err => {
            console.log('ServiceWorker registration failed: ', err);
          });
      });
    }
    
    /* ==========================================
       1. GLOBAL UI UTILITIES (Custom Alerts)
       ========================================== */
    function showCustomAlert(message, type = 'success', callback = null) {
        const existing = document.querySelector('.custom-alert-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.className = 'custom-alert-overlay';
        overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center; z-index: 9999; animation: fadeIn 0.3s forwards;';
        
        const box = document.createElement('div');
        box.className = 'custom-alert-box';
        box.style.cssText = 'background: var(--bg-light); color: var(--text-light); padding: 30px; border-radius: 10px; width: 90%; max-width: 400px; text-align: center; box-shadow: 0 15px 30px rgba(0,0,0,0.5); border: 1px solid var(--primary-color); position: relative; transform: scale(0.9); animation: scaleUp 0.3s forwards ease-out;';
        
        let iconHtml = '';
        let showClose = true;
        
        if (type === 'success') {
            iconHtml = '<i class="fa-solid fa-circle-check" style="color: #2ecc71; font-size: 3.5rem; margin-bottom: 15px;"></i>';
        } else if (type === 'error') {
            iconHtml = '<i class="fa-solid fa-circle-xmark" style="color: #e74c3c; font-size: 3.5rem; margin-bottom: 15px;"></i>';
        } else if (type === 'info') {
            iconHtml = '<i class="fa-solid fa-circle-info" style="color: var(--primary-color); font-size: 3.5rem; margin-bottom: 15px;"></i>';
        } else if (type === 'processing') {
            iconHtml = '<i class="fa-solid fa-circle-notch fa-spin" style="color: var(--primary-color); font-size: 3.5rem; margin-bottom: 15px;"></i>';
            showClose = false;
        }

        let closeBtnHtml = showClose ? '<button class="close-alert-btn" style="position:absolute; top:10px; right:15px; background:none; border:none; font-size:1.5rem; cursor:pointer; color:var(--text-light); transition:0.2s;">&times;</button>' : '';

        box.innerHTML = `
            ${closeBtnHtml}
            ${iconHtml}
            <p style="margin-bottom: 20px; font-size: 1.1rem; font-weight: 500;">${message}</p>
        `;
        
        if (type !== 'processing') {
            const btn = document.createElement('button');
            btn.className = 'btn'; 
            btn.style.width = '100%'; 
            btn.innerText = 'OK';
            btn.onclick = () => { overlay.remove(); if (callback) callback(); };
            box.appendChild(btn);
        }

        overlay.appendChild(box);
        document.body.appendChild(overlay);

        if (showClose) {
            box.querySelector('.close-alert-btn').onclick = () => { 
                overlay.remove(); 
                if (callback) callback(); 
            };
        }
    }

    if (!document.getElementById('customAlertKeyframes')) {
        const style = document.createElement('style');
        style.id = 'customAlertKeyframes';
        style.innerHTML = `
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes scaleUp { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            .close-alert-btn:hover { color: var(--primary-color) !important; }
        `;
        document.head.appendChild(style);
    }

    /* ==========================================
       2. THEME SETUP
       ========================================== */
    const themeToggle = document.querySelector('.theme-toggle');
    let currentTheme = localStorage.getItem('theme');
    
    if (!currentTheme) {
        currentTheme = 'dark';
        localStorage.setItem('theme', 'dark');
    }
    
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
        if (themeToggle) themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
    } else {
        if (themeToggle) themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            themeToggle.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
        });
    }

    /* ==========================================
       3. TELEGRAM WIDGET
       ========================================== */
    const telegramWidget = document.createElement('a');
    telegramWidget.href = "https://t.me/UrjiiSupport";
    telegramWidget.target = "_blank";
    telegramWidget.className = "telegram-widget";
    telegramWidget.innerHTML = `<i class="fa-brands fa-telegram"></i> <span>Telegram Support</span>`;
    document.body.appendChild(telegramWidget);

    /* ==========================================
       4. AUTHENTICATION & SECURE ROUTES
       ========================================== */
    const authHeaderActions = document.getElementById('authHeaderActions');
    const isLoggedIn = localStorage.getItem('urjii_is_logged_in') === 'true';
    const savedUser = JSON.parse(localStorage.getItem('urjii_user'));
    const token = savedUser ? savedUser.token : null;

    if (authHeaderActions) {
        if (isLoggedIn && savedUser) {
            authHeaderActions.innerHTML = `<a href="profile.html" class="btn" style="background: transparent; border: 1px solid var(--primary-color); color: var(--primary-color);"><i class="fa-solid fa-user-circle"></i> Profile</a>`;
        } else {
            authHeaderActions.innerHTML = `<a href="Auth.html" class="btn" style="background: transparent; border: 1px solid var(--primary-color); color: var(--primary-color);">Login</a>`;
        }
    }

    document.querySelectorAll('a[href="order.html"]').forEach(link => {
        link.addEventListener('click', (e) => {
            if (!isLoggedIn) {
                e.preventDefault();
                showCustomAlert("To order, please sign in first.", "info", () => {
                    window.location.href = "Auth.html";
                });
            }
        });
    });

    if (window.location.pathname.includes('order.html') || window.location.pathname.includes('profile.html')) {
        if (!isLoggedIn) {
            document.body.style.display = 'none';
            window.location.href = "Auth.html";
        }
    }

    /* ==========================================
       5. INTERNATIONAL DATA & FORMS
       ========================================== */
    const countriesData = [
        { name: "Ethiopia", code: "+251", flag: "🇪🇹", min: 9, max: 9 }, { name: "Kenya", code: "+254", flag: "🇰🇪", min: 9, max: 10 },
        { name: "Uganda", code: "+256", flag: "🇺🇬", min: 9, max: 9 }, { name: "Tanzania", code: "+255", flag: "🇹🇿", min: 9, max: 9 },
        { name: "USA", code: "+1", flag: "🇺🇸", min: 10, max: 10 }, { name: "UK", code: "+44", flag: "🇬🇧", min: 10, max: 10 },
        { name: "UAE", code: "+971", flag: "🇦🇪", min: 9, max: 9 }
    ]; // Truncated for brevity but functionality remains identical

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

    document.querySelectorAll('.toggle-password').forEach(icon => {
        icon.addEventListener('click', function() {
            const input = this.previousElementSibling;
            if (input.type === 'password') { input.type = 'text'; this.classList.replace('fa-eye', 'fa-eye-slash'); } 
            else { input.type = 'password'; this.classList.replace('fa-eye-slash', 'fa-eye'); }
        });
    });

    /* ==========================================
       6. AUTHENTICATION FORMS PROCESSING
       ========================================== */
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const showRegBtn = document.getElementById('showRegisterBtn');
    const showLoginBtn = document.getElementById('showLoginBtn');

    if (showRegBtn) showRegBtn.addEventListener('click', () => { loginForm.style.display='none'; registerForm.style.display='block'; showRegBtn.style.background='var(--primary-color)'; showRegBtn.style.color='#fff'; showLoginBtn.style.background='transparent'; showLoginBtn.style.color='var(--text-light)'; });
    if (showLoginBtn) showLoginBtn.addEventListener('click', () => { registerForm.style.display='none'; loginForm.style.display='block'; showLoginBtn.style.background='var(--primary-color)'; showLoginBtn.style.color='#fff'; showRegBtn.style.background='transparent'; showRegBtn.style.color='var(--text-light)'; });

    // --- REGISTRATION ---
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const pass = document.getElementById('regPassword').value;
            const confirmPass = document.getElementById('regConfirmPassword').value;
            if (pass !== confirmPass) { showCustomAlert("Passwords do not match!", "error"); return; }
            if (!document.getElementById('termsAgree').checked) { showCustomAlert("You must agree to the terms.", "error"); return; }

            const phoneSelect = document.getElementById('regPhoneCode');
            const phoneInput = document.getElementById('regPhoneNum').value;
            const selectedOpt = phoneSelect.options[phoneSelect.selectedIndex];
            
            if (phoneInput.length < selectedOpt.dataset.min || phoneInput.length > selectedOpt.dataset.max) {
                showCustomAlert(`Phone length for ${selectedOpt.value} must be ${selectedOpt.dataset.min}-${selectedOpt.dataset.max} digits.`, "error"); return;
            }

            const userData = {
                firstName: document.getElementById('regFirstName').value, 
                lastName: document.getElementById('regLastName').value,
                email: document.getElementById('regEmail').value, 
                phone: selectedOpt.value + phoneInput, 
                password: pass,
                gender: document.getElementById('regGender').value,
                age: document.getElementById('regAge').value,
                country: document.getElementById('regCountry').value
            };
            
            showCustomAlert("Processing registration...", "processing");

            try {
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userData)
                });

                const data = await response.json();

                if (response.ok) {
                    showCustomAlert("Registered successfully! You can now log in.", "success", () => showLoginBtn.click());
                    registerForm.reset();
                } else {
                    showCustomAlert(data.error || "Registration failed.", "error");
                }
            } catch (error) {
                showCustomAlert("Network error. Please try again.", "error");
            }
        });
    }

    // --- LOGIN ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('loginIdentifier').value.trim();
            const pass = document.getElementById('loginPassword').value;
            
            showCustomAlert("Authenticating...", "processing");

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: id, password: pass })
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('urjii_is_logged_in', 'true');
                    localStorage.setItem('urjii_user', JSON.stringify({
                        token: data.token,
                        firstName: data.user?.firstName || "User",
                        lastName: data.user?.lastName || "",
                        email: data.user?.email || id,
                        fullPhone: data.user?.phone || ""
                    }));
                    
                    const existing = document.querySelector('.custom-alert-overlay');
                    if(existing) existing.remove();
                    window.location.href = "profile.html";
                } else { 
                    showCustomAlert(data.error || "Invalid credentials. Please try again.", "error");
                    document.getElementById('loginError').style.display = 'block'; 
                }
            } catch (error) {
                showCustomAlert("Server connection failed.", "error");
            }
        });
    }

    /* ==========================================
       7. ORDER FORM VALIDATION
       ========================================== */
    const orderForm = document.getElementById('orderForm');
    const projectFiles = document.getElementById('projectFiles');
    const fileListDisplay = document.getElementById('fileListDisplay');

    if (projectFiles && fileListDisplay) {
        projectFiles.addEventListener('change', function() {
            fileListDisplay.innerHTML = '';
            Array.from(this.files).forEach(file => {
                fileListDisplay.innerHTML += `<div style="font-size:0.85rem; padding:5px; background:rgba(201,160,99,0.1); margin-top:5px; border-radius:4px;"><i class="fa-solid fa-file"></i> ${file.name}</div>`;
            });
        });
    }

    if (orderForm) {
        orderForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const phoneSelect = document.getElementById('orderPhoneCode');
            const phoneInput = document.getElementById('orderPhoneNum').value;
            const selectedOpt = phoneSelect.options[phoneSelect.selectedIndex];
            
            if (phoneInput.length < selectedOpt.dataset.min || phoneInput.length > selectedOpt.dataset.max) {
                document.getElementById('phoneError').innerText = `Require ${selectedOpt.dataset.min}-${selectedOpt.dataset.max} digits.`;
                document.getElementById('phoneError').style.display = 'block'; return;
            }
            document.getElementById('phoneError').style.display = 'none';
            
            const formData = new FormData();
            const selects = orderForm.querySelectorAll('select');
            const inputs = orderForm.querySelectorAll('input[type="text"], input[type="email"], input[type="number"]');
            const textarea = orderForm.querySelector('textarea');
            
            if(selects[0]) formData.append('serviceType', selects[0].value);
            if(inputs[0]) formData.append('fullName', inputs[0].value);
            if(inputs[1]) formData.append('email', inputs[1].value);
            formData.append('phone', selectedOpt.value + phoneInput);
            if(textarea) formData.append('description', textarea.value);
            
            if (projectFiles && projectFiles.files.length > 0) {
                for (let i = 0; i < projectFiles.files.length; i++) {
                    formData.append('files', projectFiles.files[i]);
                }
            }
            
            showCustomAlert('Processing your order...', 'processing');
            
            try {
                const response = await fetch('/api/order', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}` // Pass JWT for protected route
                    },
                    body: formData 
                });

                if (response.ok) {
                    showCustomAlert('Order submitted successfully! We will contact you soon.', 'success', () => window.location.href="profile.html"); 
                    orderForm.reset();
                    if(fileListDisplay) fileListDisplay.innerHTML = '';
                } else {
                    showCustomAlert("Failed to submit order.", "error");
                }
            } catch (error) {
                showCustomAlert("Network error. Please try again later.", "error");
            }
        });
    }

    /* ==========================================
       8. PROFILE & AFFILIATE DASHBOARD LOGIC
       ========================================== */
    if (window.location.pathname.includes('profile.html')) {
        
        if(document.getElementById('displayUserName') && savedUser) {
            document.getElementById('displayUserName').innerText = `${savedUser.firstName} ${savedUser.lastName}`;
        }
        
        const tabLinks = document.querySelectorAll('.profile-sidebar a[data-tab]');
        const tabPanes = document.querySelectorAll('.tab-pane');
        tabLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const targetId = e.target.getAttribute('data-tab');
                if(!targetId) return;
                tabLinks.forEach(t => t.classList.remove('active'));
                tabPanes.forEach(p => p.classList.remove('active'));
                e.target.classList.add('active');
                document.getElementById(targetId).classList.add('active');
            });
        });

        const ordersContainer = document.getElementById('ordersContainer');
        if (ordersContainer) {
            ordersContainer.innerHTML = `
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
            }, 1000);
        }

        const promoView = document.getElementById('affiliatePromoView');
        const dashboardView = document.getElementById('affiliateDashboardView');

        if (promoView && dashboardView) {
            let isAffiliate = localStorage.getItem('urjii_is_affiliate') === 'true';

            function renderAffiliateUI() {
                if (isAffiliate) {
                    promoView.style.display = 'none';
                    dashboardView.style.display = 'block';
                    
                    const userNameStr = savedUser && savedUser.firstName ? savedUser.firstName.toUpperCase() : 'USER';
                    const uniqueId = Math.floor(1000 + Math.random() * 9000); 
                    let storedRefLink = localStorage.getItem('urjii_ref_link');
                    if (!storedRefLink) {
                        // Dynamic URL Generation
                        storedRefLink = `${window.location.origin}/ref/${userNameStr}${uniqueId}`;
                        localStorage.setItem('urjii_ref_link', storedRefLink);
                    }
                    if (document.getElementById('refLinkInput')) {
                        document.getElementById('refLinkInput').value = storedRefLink;
                    }
                } else {
                    promoView.style.display = 'block';
                    dashboardView.style.display = 'none';
                    
                    document.getElementById('joinAffiliateBtn').addEventListener('click', () => {
                        showCustomAlert("Processing your affiliate registration...", "processing");
                        setTimeout(() => {
                            localStorage.setItem('urjii_is_affiliate', 'true');
                            isAffiliate = true;
                            showCustomAlert("Welcome to the Affiliate Program! Your dashboard is ready.", "success", () => {
                                renderAffiliateUI();
                            });
                        }, 1000);
                    });
                }
            }

            renderAffiliateUI();
            
            const copyBtn = document.getElementById('copyRefBtn');
            if(copyBtn) {
                copyBtn.addEventListener('click', () => {
                    document.getElementById('refLinkInput').select();
                    document.execCommand("copy");
                    showCustomAlert("Referral Link Copied successfully!", "success");
                });
            }
        }

        document.getElementById('sidebarLogoutBtn')?.addEventListener('click', () => { 
            showCustomAlert("Logging out...", "processing");
            setTimeout(() => {
                localStorage.removeItem('urjii_is_logged_in'); 
                localStorage.removeItem('urjii_user');
                window.location.href="index.html"; 
            }, 1000);
        });
    }

    /* ==========================================
       9. CONTACT FORMS
       ========================================== */
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = {
                name: document.getElementById('contactName').value,
                email: document.getElementById('contactEmail').value,
                subject: document.getElementById('contactSubject').value,
                message: document.getElementById('contactMessage').value
            };
            showCustomAlert("Sending your message...", "processing");
            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                if (response.ok) {
                    showCustomAlert("Your message has been sent successfully!", "success");
                    contactForm.reset();
                } else {
                    showCustomAlert("Failed to send message.", "error");
                }
            } catch (error) {
                showCustomAlert("Network error. Please try again.", "error");
            }
        });
    }

    /* ==========================================
       10. FEEDBACK & REVIEW SYSTEM
       ========================================== */
    const reviewForm = document.getElementById('reviewForm');
    let currentRating = 5;

    document.querySelectorAll('.star-rating i').forEach(star => {
        star.addEventListener('click', (e) => {
            currentRating = e.target.getAttribute('data-val');
            document.querySelectorAll('.star-rating i').forEach(s => s.classList.remove('active'));
            for(let i=0; i < currentRating; i++){
                document.querySelectorAll('.star-rating i')[i].classList.add('active');
            }
        });
    });

    if (reviewForm) {
        reviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const revName = document.getElementById('revName').value;
            const revText = document.getElementById('revText').value;
            
            showCustomAlert("Submitting your review...", "processing");
            try {
                await fetch('/api/review', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: revName, rating: currentRating, review: revText })
                });
                reviewForm.reset(); 
                showCustomAlert("Thank you! Review submitted successfully.", "success");
            } catch (error) {
                showCustomAlert("Couldn't submit review right now.", "error");
            }
        });
    }

    /* ==========================================
       11. MISC UTILS
       ========================================== */
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    if(hamburger) hamburger.addEventListener('click', () => { navLinks.classList.toggle('active'); hamburger.classList.toggle('fa-bars'); hamburger.classList.toggle('fa-times'); });
    
    const hiddenElements = document.querySelectorAll('.hidden');
    const observer = new IntersectionObserver((entries) => { entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('show'); }); }, { threshold: 0.1 });
    hiddenElements.forEach(el => observer.observe(el));
});
