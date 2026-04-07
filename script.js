document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://urjii-software-company.vercel.app/api';

    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then(registration => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
          }, err => {});
      });
    }

    // Track Affiliate Links
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('ref')) {
        localStorage.setItem('urjii_referred_by', urlParams.get('ref'));
        fetch(`${API_URL}/ref/${urlParams.get('ref')}`).catch(e => console.log(e));
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

        // Allow HTML inside the message for specific formatting (like the success message)
        box.innerHTML = `
            ${closeBtnHtml}
            ${iconHtml}
            <div style="margin-bottom: 20px; font-size: 1.1rem; font-weight: 500;">${message}</div>
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
    const token = localStorage.getItem('urjii_token');

    if (authHeaderActions) {
        if (token) {
            authHeaderActions.innerHTML = `<a href="/profile" class="btn" style="background: transparent; border: 1px solid var(--primary-color); color: var(--primary-color);"><i class="fa-solid fa-user-circle"></i> Profile</a>`;
        } else {
            authHeaderActions.innerHTML = `<a href="/Auth" class="btn" style="background: transparent; border: 1px solid var(--primary-color); color: var(--primary-color);">Login</a>`;
        }
    }

    document.querySelectorAll('a[href="/order"]').forEach(link => {
        link.addEventListener('click', (e) => {
            if (!token) {
                e.preventDefault();
                showCustomAlert("To order, please sign in first.", "info", () => {
                    window.location.href = "/Auth";
                });
            }
        });
    });

    if (window.location.pathname.includes('/order') || window.location.pathname.includes('/profile')) {
        if (!token) {
            document.body.style.display = 'none';
            window.location.href = "/Auth";
        }
    }

    /* ==========================================
       5. INTERNATIONAL DATA & FORMS
       ========================================== */
    const countriesData =[
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
    const forms = {
        login: document.getElementById('loginForm'),
        register: document.getElementById('registerForm'),
        forgot: document.getElementById('forgotPasswordForm'),
        reset: document.getElementById('resetPasswordForm')
    };

    document.getElementById('showRegisterBtn')?.addEventListener('click', () => { forms.login.style.display='none'; forms.register.style.display='block'; document.getElementById('showRegisterBtn').style.background='var(--primary-color)'; document.getElementById('showRegisterBtn').style.color='#fff'; document.getElementById('showLoginBtn').style.background='transparent'; document.getElementById('showLoginBtn').style.color='var(--text-light)'; });
    document.getElementById('showLoginBtn')?.addEventListener('click', () => { forms.register.style.display='none'; forms.login.style.display='block'; document.getElementById('showLoginBtn').style.background='var(--primary-color)'; document.getElementById('showLoginBtn').style.color='#fff'; document.getElementById('showRegisterBtn').style.background='transparent'; document.getElementById('showRegisterBtn').style.color='var(--text-light)'; });
    document.getElementById('forgotPasswordLink')?.addEventListener('click', (e) => { e.preventDefault(); forms.login.style.display='none'; document.getElementById('authTabs').style.display='none'; forms.forgot.style.display='block'; });
    document.getElementById('backToLoginLink')?.addEventListener('click', (e) => { e.preventDefault(); forms.forgot.style.display='none'; document.getElementById('authTabs').style.display='flex'; forms.login.style.display='block'; });

    // --- REGISTRATION ---
    if (forms.register) {
        forms.register.addEventListener('submit', async (e) => {
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
                country: document.getElementById('regCountry').value,
                referredBy: localStorage.getItem('urjii_referred_by') || null
            };
            
            showCustomAlert("Processing registration...", "processing");
            try {
                const response = await fetch(`${API_URL}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userData)
                });
                const data = await response.json();
                if (response.ok) {
                    showCustomAlert("Registered successfully! You can now log in.", "success", () => document.getElementById('showLoginBtn').click());
                    forms.register.reset();
                } else {
                    showCustomAlert(data.error || "Registration failed.", "error");
                }
            } catch (error) {
                showCustomAlert("Network error. Please try again.", "error");
            }
        });
    }

    // --- LOGIN ---
    if (forms.login) {
        forms.login.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('loginIdentifier').value.trim();
            const pass = document.getElementById('loginPassword').value;
            
            showCustomAlert("Authenticating...", "processing");
            try {
                const response = await fetch(`${API_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ identifier: id, password: pass })
                });
                const data = await response.json();
                if (response.ok) {
                    localStorage.setItem('urjii_token', data.token);
                    const existing = document.querySelector('.custom-alert-overlay');
                    if(existing) existing.remove();
                    window.location.href = "/profile";
                } else { 
                    showCustomAlert(data.error || "Invalid credentials. Please try again.", "error");
                }
            } catch (error) {
                showCustomAlert("Server connection failed.", "error");
            }
        });
    }

    // --- FORGOT PASSWORD ---
    forms.forgot?.addEventListener('submit', async (e) => {
        e.preventDefault();
        showCustomAlert("Generating reset token...", "processing");
        const res = await fetch(`${API_URL}/forgot-password`, { 
            method: 'POST', headers: {'Content-Type': 'application/json'}, 
            body: JSON.stringify({ identifier: document.getElementById('forgotIdentifier').value }) 
        });
        const data = await res.json();
        if (res.ok) {
            showCustomAlert(`Reset Token Generated: ${data.resetToken} \n\n(In production, this is emailed. Please copy this token.)`, "success", () => {
                forms.forgot.style.display = 'none'; forms.reset.style.display = 'block';
            });
        } else showCustomAlert(data.error, "error");
    });

    // --- RESET PASSWORD ---
    forms.reset?.addEventListener('submit', async (e) => {
        e.preventDefault();
        showCustomAlert("Resetting password...", "processing");
        const res = await fetch(`${API_URL}/reset-password`, { 
            method: 'POST', headers: {'Content-Type': 'application/json'}, 
            body: JSON.stringify({ resetToken: document.getElementById('resetTokenInput').value, newPassword: document.getElementById('newResetPassword').value }) 
        });
        if (res.ok) {
            showCustomAlert("Password reset successful! Redirecting to homepage.", "success", () => { window.location.href = "/"; });
        } else showCustomAlert("Invalid or expired token.", "error");
    });

    /* ==========================================
       7. SMART ORDER FORM VALIDATION & LOGIC
       ========================================== */
    const orderForm = document.getElementById('orderForm');
    const projectFiles = document.getElementById('projectFiles');
    const fileListDisplay = document.getElementById('fileListDisplay');
    const probTextarea = document.getElementById('businessProblem');
    const wordCountDisplay = document.getElementById('wordCountDisplay');
    const orderSubmitBtn = document.getElementById('orderSubmitBtn');

    // Word Count Tracker
    if (probTextarea && wordCountDisplay) {
        probTextarea.addEventListener('input', () => {
            const words = probTextarea.value.trim().split(/\s+/).filter(w => w.length > 0);
            wordCountDisplay.innerText = `${words.length} / 120 words`;
            if (words.length > 120) {
                wordCountDisplay.style.color = '#e74c3c';
            } else {
                wordCountDisplay.style.color = '#888';
            }
        });
    }

    // File Upload Display
    if (projectFiles && fileListDisplay) {
        projectFiles.addEventListener('change', function() {
            fileListDisplay.innerHTML = '';
            Array.from(this.files).forEach(file => {
                fileListDisplay.innerHTML += `<div style="font-size:0.85rem; padding:5px; background:rgba(201,160,99,0.1); margin-top:5px; border-radius:4px;"><i class="fa-solid fa-file"></i> ${file.name}</div>`;
            });
        });
    }

    // Submit Order
    if (orderForm) {
        orderForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Check Word Count Limit
            const words = probTextarea.value.trim().split(/\s+/).filter(w => w.length > 0);
            if (words.length > 120) {
                showCustomAlert("Please limit your business problem description to 120 words.", "error");
                return;
            }

            // Check Phone Validation
            const phoneSelect = document.getElementById('orderPhoneCode');
            const phoneInput = document.getElementById('orderPhoneNum').value;
            const selectedOpt = phoneSelect.options[phoneSelect.selectedIndex];
            
            if (phoneInput.length < selectedOpt.dataset.min || phoneInput.length > selectedOpt.dataset.max) {
                document.getElementById('phoneError').innerText = `Require ${selectedOpt.dataset.min}-${selectedOpt.dataset.max} digits.`;
                document.getElementById('phoneError').style.display = 'block'; return;
            }
            document.getElementById('phoneError').style.display = 'none';
            
            // Button loading state
            const originalBtnText = orderSubmitBtn.innerText;
            orderSubmitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Submitting...';
            orderSubmitBtn.disabled = true;
            
            const formData = new FormData();
            formData.append('serviceType', document.getElementById('serviceType').value);
            formData.append('fullName', document.getElementById('fullName').value);
            formData.append('jobTitle', document.getElementById('jobTitle').value);
            formData.append('companyName', document.getElementById('companyName').value);
            formData.append('email', document.getElementById('email').value);
            formData.append('phone', selectedOpt.value + phoneInput);
            formData.append('businessProblem', probTextarea.value);
            formData.append('hasWebsite', document.getElementById('hasWebsite').value);
            formData.append('launchDate', document.getElementById('launchDate').value);
            formData.append('budgetRange', document.getElementById('budgetRange').value);
            formData.append('primaryGoal', document.getElementById('primaryGoal').value);
            
            // Handle Radio Buttons for Communication
            const preferredComm = document.querySelector('input[name="preferredComm"]:checked').value;
            formData.append('preferredCommunication', preferredComm);
            
            if (projectFiles && projectFiles.files.length > 0) {
                for (let i = 0; i < projectFiles.files.length; i++) {
                    formData.append('files', projectFiles.files[i]);
                }
            }
            
            try {
                const response = await fetch(`${API_URL}/order`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData 
                });

                if (response.ok) {
                    showCustomAlert(
                        `<p style="font-size:1.2rem; font-weight:600; margin-bottom:10px;">Thank you for your request.</p>
                         <p style="font-size:1rem; color:#888;">We will review your request and contact you within a day through your preferred communication method.</p>`, 
                        'success', 
                        () => window.location.href="/profile"
                    ); 
                    orderForm.reset();
                    if(fileListDisplay) fileListDisplay.innerHTML = '';
                    if(wordCountDisplay) wordCountDisplay.innerText = '0 / 120 words';
                } else {
                    showCustomAlert("Failed to submit order.", "error");
                }
            } catch (error) {
                showCustomAlert("Network error. Please try again later.", "error");
            } finally {
                // Restore button
                orderSubmitBtn.innerHTML = originalBtnText;
                orderSubmitBtn.disabled = false;
            }
        });
    }

    /* ==========================================
       8. PROFILE & AFFILIATE DASHBOARD LOGIC
       ========================================== */
    if (window.location.pathname.includes('/profile')) {
        
        // Tab Switching
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

        // Fetch User Data from Database
        fetch(`${API_URL}/profile`, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => res.json())
        .then(user => {
            if(document.getElementById('displayUserName')) document.getElementById('displayUserName').innerText = user.firstName;
            if(document.getElementById('profFirstName')) document.getElementById('profFirstName').value = user.firstName;
            if(document.getElementById('profLastName')) document.getElementById('profLastName').value = user.lastName;
            if(document.getElementById('profEmail')) document.getElementById('profEmail').value = user.email;
            if(document.getElementById('profGender')) document.getElementById('profGender').value = user.gender;
            if(document.getElementById('profAge')) document.getElementById('profAge').value = user.age;
            
            // Affiliate View Setup
            if(document.getElementById('affiliatePromoView') && document.getElementById('affiliateDashboardView')) {
                document.getElementById('affiliatePromoView').style.display = 'none';
                document.getElementById('affiliateDashboardView').style.display = 'block';
                
                const statsCards = document.querySelectorAll('.stat-card h3');
                if(statsCards.length >= 3) {
                    statsCards[0].innerText = user.referralClicks || 0;
                    statsCards[1].innerText = user.successfulReferrals || 0;
                    statsCards[2].innerText = `$${user.totalEarned || 0}`;
                }

                if(document.getElementById('refLinkInput')) {
                    document.getElementById('refLinkInput').value = `${window.location.origin}/?ref=${user.referralCode}`;
                }
            }
        }).catch(e => console.log(e));

        // Update Profile
        document.getElementById('profileForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            showCustomAlert("Updating...", "processing");
            await fetch(`${API_URL}/profile`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    firstName: document.getElementById('profFirstName').value,
                    lastName: document.getElementById('profLastName').value,
                    gender: document.getElementById('profGender').value,
                    age: document.getElementById('profAge').value,
                    country: document.getElementById('profCountry').value
                })
            });
            showCustomAlert("Profile updated successfully!", "success");
        });

        // Change Password Security
        document.getElementById('passwordForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const curr = document.querySelectorAll('#tab-security input[type="password"]')[0].value;
            const newP = document.querySelectorAll('#tab-security input[type="password"]')[1].value;
            const conf = document.querySelectorAll('#tab-security input[type="password"]')[2].value;
            
            if (newP !== conf) return showCustomAlert("New passwords don't match!", "error");
            
            showCustomAlert("Updating security...", "processing");
            const res = await fetch(`${API_URL}/password`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ currentPassword: curr, newPassword: newP })
            });
            if (res.ok) { showCustomAlert("Password Updated Securely!", "success"); e.target.reset(); }
            else { const d = await res.json(); showCustomAlert(d.error || "Incorrect current password.", "error"); }
        });

        document.getElementById('sidebarLogoutBtn')?.addEventListener('click', () => { 
            showCustomAlert("Logging out...", "processing");
            setTimeout(() => {
                localStorage.removeItem('urjii_token'); 
                window.location.href="/"; 
            }, 1000);
        });

        const copyBtn = document.getElementById('copyRefBtn');
        if(copyBtn) {
            copyBtn.addEventListener('click', () => {
                document.getElementById('refLinkInput').select();
                document.execCommand("copy");
                showCustomAlert("Referral Link Copied successfully!", "success");
            });
        }
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
                const response = await fetch(`${API_URL}/contact`, {
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
                await fetch(`${API_URL}/review`, {
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
       11. MISC UTILS (Blog Search, Mobile Menu, Animations)
       ========================================== */
    const blogSearch = document.getElementById('blogSearch');
    if (blogSearch) {
        blogSearch.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            document.querySelectorAll('.blog-card').forEach(card => {
                card.style.display = card.innerText.toLowerCase().includes(term) ? 'block' : 'none';
            });
        });
    }

    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    if(hamburger) {
        hamburger.addEventListener('click', () => { 
            navLinks.classList.toggle('active'); 
            hamburger.classList.toggle('fa-bars'); 
            hamburger.classList.toggle('fa-times'); 
        });
    }
    
    const hiddenElements = document.querySelectorAll('.hidden');
    if('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => { 
            entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('show'); }); 
        }, { threshold: 0.1 });
        hiddenElements.forEach(el => observer.observe(el));
    } else {
        hiddenElements.forEach(el => el.classList.add('show'));
    }
});
