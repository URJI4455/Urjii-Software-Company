document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://urjii-software-company.vercel.app/api'; // Or your local API
    const token = localStorage.getItem('urjii_token');

    // 1. Custom Alerts
    window.showCustomAlert = function(msg, type = 'success', cb = null) {
        const exist = document.querySelector('.alert-overlay');
        if(exist) exist.remove();
        const ov = document.createElement('div');
        ov.className = 'alert-overlay';
        ov.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);display:flex;justify-content:center;align-items:center;z-index:9999;';
        const box = document.createElement('div');
        box.style.cssText = 'background:var(--bg-light);color:var(--text-light);padding:30px;border-radius:10px;text-align:center;border:1px solid var(--primary-color);max-width:400px;width:90%;';
        box.innerHTML = `<h3 style="margin-bottom:15px;color:${type==='error'?'#e74c3c':'var(--primary-color)'}">${type.toUpperCase()}</h3><p style="margin-bottom:20px;">${msg}</p>`;
        if(type !== 'processing') {
            const btn = document.createElement('button'); btn.className='btn'; btn.innerText='OK';
            btn.onclick = () => { ov.remove(); if(cb) cb(); };
            box.appendChild(btn);
        }
        ov.appendChild(box); document.body.appendChild(ov);
    };

    // 2. Notifications System
    function triggerNotification(title, text) {
        const notifMenu = document.getElementById('notifDropdown');
        const badge = document.getElementById('notifBadge');
        if(!notifMenu || !badge) return;
        
        let notifs = JSON.parse(localStorage.getItem('urjii_notifs') || '[]');
        notifs.unshift({ title, text, time: new Date().toLocaleTimeString() });
        localStorage.setItem('urjii_notifs', JSON.stringify(notifs));
        
        badge.innerText = notifs.length;
        badge.style.display = 'block';
        
        showCustomAlert(text, 'info'); // Popup Alert for new events
        renderNotifications();
    }

    function renderNotifications() {
        const notifMenu = document.getElementById('notifDropdown');
        if(!notifMenu) return;
        let notifs = JSON.parse(localStorage.getItem('urjii_notifs') || '[]');
        notifMenu.innerHTML = notifs.length === 0 ? '<div class="notif-item">No new notifications.</div>' : '';
        notifs.forEach(n => {
            notifMenu.innerHTML += `<div class="notif-item"><strong>${n.title}</strong><br><small style="color:#888">${n.time}</small><p>${n.text}</p></div>`;
        });
    }
    
    document.querySelector('.notif-wrapper')?.addEventListener('click', () => {
        document.getElementById('notifDropdown').classList.toggle('active');
        document.getElementById('notifBadge').style.display = 'none';
        localStorage.removeItem('urjii_notifs'); // Mark as read
    });
    renderNotifications();

    // 3. Hero Sliders
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;
    if(slides.length > 0) {
        setInterval(() => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }, 5000);
        document.querySelector('.slider-next')?.addEventListener('click', () => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        });
        document.querySelector('.slider-prev')?.addEventListener('click', () => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            slides[currentSlide].classList.add('active');
        });
    }

    // 4. Upcoming Services Alert
    document.querySelectorAll('.upcoming-service').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            showCustomAlert("This service is upcoming, please come back later.", "info");
        });
    });

    // 5. Multi-Step Form (Order Page)
    const steps = document.querySelectorAll('.form-step');
    if(steps.length > 0) {
        const progBar = document.getElementById('orderProgress');
        const progText = document.querySelector('.step-indicator');
        
        document.querySelector('.next-btn')?.addEventListener('click', () => {
            // Basic validation for step 1
            const inputs = steps[0].querySelectorAll('input[required]');
            let valid = true; inputs.forEach(i => { if(!i.value) valid=false; });
            if(!valid) return showCustomAlert("Fill all required fields.", "error");
            
            steps[0].classList.remove('active'); steps[1].classList.add('active');
            progBar.style.width = '100%'; progText.innerText = 'Step 2/2';
        });
        document.querySelector('.prev-btn')?.addEventListener('click', () => {
            steps[1].classList.remove('active'); steps[0].classList.add('active');
            progBar.style.width = '50%'; progText.innerText = 'Step 1/2';
        });

        const launchDate = document.getElementById('launchDate');
        if(launchDate) launchDate.min = new Date().toISOString().split('T')[0]; // No past dates
    }

    // 6. Accordion (FAQ)
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            item.classList.toggle('active');
        });
    });

    // 7. Newsletter
    document.querySelectorAll('.newsletter-form').forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = form.querySelector('input').value;
            triggerNotification("Newsletter", "You successfully subscribed to our newsletter!");
            form.reset();
            fetch(`${API_URL}/newsletter`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email})});
        });
    });

    // 8. Order Submission
    const orderForm = document.getElementById('orderForm');
    if(orderForm) {
        orderForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            showCustomAlert("Submitting request...", "processing");
            const fd = new FormData();
            fd.append('serviceType', document.getElementById('serviceType').value);
            fd.append('fullName', document.getElementById('fullName').value);
            fd.append('email', document.getElementById('email').value);
            fd.append('phone', document.getElementById('phone').value);
            fd.append('companyName', document.getElementById('companyName').value);
            fd.append('budgetRange', document.getElementById('budgetRange').value);
            fd.append('businessProblem', document.getElementById('businessProblem').value);
            fd.append('launchDate', document.getElementById('launchDate').value);
            
            try {
                const res = await fetch(`${API_URL}/order`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: fd });
                if(res.ok) {
                    triggerNotification("Order Received", "Your project request has been submitted successfully!");
                    showCustomAlert("Thank you for your request. We will contact you within a day.", "success", () => window.location.href='/profile.html');
                } else { showCustomAlert("Submission failed", "error"); }
            } catch(e) { showCustomAlert("Network error", "error"); }
        });
    }

    // 9. Affiliate Logic (Profile)
    document.getElementById('joinAffiliateBtn')?.addEventListener('click', async () => {
        showCustomAlert("Registering...", "processing");
        const res = await fetch(`${API_URL}/affiliate/register`, { method: 'POST', headers: {'Authorization': `Bearer ${token}`} });
        if(res.ok) { showCustomAlert("You are now an affiliate partner!", "success", () => location.reload()); }
    });

    // 10. Profile Edit Restrictions
    if(window.location.pathname.includes('profile')) {
        fetch(`${API_URL}/profile`, { headers: { 'Authorization': `Bearer ${token}` }})
        .then(r=>r.json()).then(user => {
            if(user.lastProfileUpdate) {
                const diff = new Date() - new Date(user.lastProfileUpdate);
                if(diff < 30*24*60*60*1000) {
                    document.getElementById('profileForm').querySelectorAll('input, select').forEach(i => i.disabled = true);
                    document.getElementById('profileUpdateBtn').innerText = "Edit Locked (Wait 30 Days)";
                    document.getElementById('profileUpdateBtn').disabled = true;
                }
            }
            if(user.affiliateRegistered && document.getElementById('affiliateDashboardView')) {
                document.getElementById('affiliatePromoView').style.display = 'none';
                document.getElementById('affiliateDashboardView').style.display = 'block';
                document.getElementById('refLinkInput').value = `${window.location.origin}/?ref=${user.referralCode}`;
            }
        });

        // Logout
        document.getElementById('sidebarLogoutBtn')?.addEventListener('click', () => {
            localStorage.removeItem('urjii_token');
            window.location.href = '/Auth.html';
        });
    }
});
