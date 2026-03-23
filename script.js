// ১. প্রাথমিক সেটিংস ও ফায়ারবেস কনফিগ
const firebaseConfig = {
    apiKey: "AIzaSyCCts8zQixE0uGjjK0uUTaR_NnLrKeXthw",
    authDomain: "app-aybay.firebaseapp.com",
    projectId: "app-aybay",
    storageBucket: "app-aybay.firebasestorage.app",
    messagingSenderId: "464828082296",
    appId: "1:464828082296:web:1af28015038f4d76ce658d"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const monthsBN = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
const toBengali = n => n.toString().replace(/\d/g, d => bengaliDigits[d]);

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let trash = JSON.parse(localStorage.getItem('trash')) || [];
let currentFilter = 'all';
let deferredPrompt; 

// ২. PWA ইন্সটল পপ-আপ ও বাটন লজিক (তাত্ক্ষণিক)
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    // যদি অ্যাপটি standalone মোডে না থাকে (অর্থাৎ ব্রাউজারে থাকে)
    if (!window.matchMedia('(display-mode: standalone)').matches) {
        // সাথে সাথে পপ-আপ দেখাবে
        const modal = document.getElementById('install-modal');
        if(modal) modal.style.display = 'flex';
        
        // হেডার ও ড্রয়ারের বাটনগুলো দেখাবে
        const hBtn = document.getElementById('install-header-btn');
        const dBtn = document.getElementById('install-area-drawer');
        if(hBtn) hBtn.style.display = 'block';
        if(dBtn) dBtn.style.display = 'block';
    }
});

async function triggerInstall() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            closeInstallModal();
        }
        deferredPrompt = null;
    }
}

function closeInstallModal() {
    const modal = document.getElementById('install-modal');
    if(modal) modal.style.display = 'none';
}

function hideInstallButtons() {
    const ids = ['install-modal', 'install-header-btn', 'install-area-drawer'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.style.display = 'none';
    });
}

window.addEventListener('appinstalled', () => {
    hideInstallButtons();
    deferredPrompt = null;
});

// ৩. লগইন ও সিঙ্ক্রোনাইজেশন লজিক
function toggleAuthBox() {
    const box = document.getElementById('auth-box');
    box.style.display = box.style.display === 'none' ? 'block' : 'none';
}

function confirmLogin() {
    // পপ-আপ থাকাকালীন যেন লগইন কনফার্মেশন ঝামেলা না করে, তাই কিছুটা সময় দেওয়া
    const choice = confirm("লগইন করলে আপনার তথ্য অনলাইনে সিঙ্ক হবে। সুরক্ষার জন্য ব্যাকআপ নিতে চান?");
    if (choice) {
        exportData();
        setTimeout(() => googleLogin(), 2000);
    } else {
        googleLogin();
    }
}

function googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).then((result) => {
        syncWithCloud(result.user);
        document.getElementById('auth-box').style.display = 'none';
    }).catch((error) => { alert("লগইন ব্যর্থ হয়েছে!"); });
}

function logout() {
    if(confirm("লগআউট করলে ফোন থেকে বর্তমান ডাটা মুছে যাবে। নিশ্চিত?")) {
        auth.signOut().then(() => {
            localStorage.clear();
            transactions = [];
            trash = [];
            window.location.reload();
        });
    }
}

function syncWithCloud(user) {
    if (!user) return;
    const userRef = db.ref("users/" + user.uid);
    userRef.once("value", (snapshot) => {
        if (snapshot.exists()) {
            const cloudData = snapshot.val();
            if (confirm("আগের অনলাইন ডাটা কি লোড করবেন? (না করলে বর্তমান ডাটা অনলাইনে সেভ হবে)")) {
                transactions = cloudData.transactions || [];
                trash = cloudData.trash || [];
                saveAndRender();
            }
        } else {
            saveAndRender();
        }
        updateAuthUI(user);
    });
}

function updateAuthUI(user) {
    const defaultIcon = document.getElementById('default-user-icon');
    const headerImg = document.getElementById('user-img-header');
    
    if (user) {
        if(defaultIcon) defaultIcon.style.display = 'none';
        if(headerImg) { headerImg.style.display = 'block'; headerImg.src = user.photoURL; }
        document.getElementById('logged-out-content').style.display = 'none';
        document.getElementById('logged-in-content').style.display = 'block';
        document.getElementById('user-img-box').src = user.photoURL;
        document.getElementById('user-name-box').innerText = user.displayName;
    } else {
        if(defaultIcon) defaultIcon.style.display = 'block';
        if(headerImg) headerImg.style.display = 'none';
        document.getElementById('logged-out-content').style.display = 'block';
        document.getElementById('logged-in-content').style.display = 'none';
    }
}

// ৪. কোর ফাংশনসমূহ (UI & Actions)
function initFilters() {
    const mSelect = document.getElementById('filter-month');
    const ySelect = document.getElementById('filter-year');
    const now = new Date();
    if(!mSelect || !ySelect) return;
    mSelect.innerHTML = ''; ySelect.innerHTML = '';
    monthsBN.forEach((m, i) => {
        let opt = new Option(m, i);
        if(i === now.getMonth()) opt.selected = true;
        mSelect.add(opt);
    });
    for(let i = 2024; i <= 2030; i++) {
        let opt = new Option(toBengali(i), i);
        if(i === now.getFullYear()) opt.selected = true;
        ySelect.add(opt);
    }
}

function toggleDrawer() {
    const isOpen = document.getElementById('drawer').classList.toggle('open');
    document.getElementById('overlay').style.display = isOpen ? 'block' : 'none';
}

function openNameModal() { document.getElementById('name-modal').style.display = 'flex'; }
function closeNameModal() { document.getElementById('name-modal').style.display = 'none'; }
function saveName() {
    const name = document.getElementById('name-input').value.trim();
    if(name) {
        localStorage.setItem('user-name', name);
        document.getElementById('display-name').innerText = `আয় ব্যয় - ${name}`;
        closeNameModal();
    }
}

function toggleTheme() {
    const isDark = document.body.classList.toggle('Dark-Asifio');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeUI(isDark);
}

function updateThemeUI(isDark) {
    const themeText = document.getElementById('theme-text');
    const themeIcon = document.getElementById('theme-icon-container');
    if (!themeText || !themeIcon) return;
    if (isDark) {
        themeText.innerText = "লাইট মোড";
        themeIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
    } else {
        themeText.innerText = "ডার্ক মোড";
        themeIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
    }
}

function toggleFont() {
    const isSiliguri = document.body.classList.toggle('font-siliguri');
    localStorage.setItem('font-pref', isSiliguri ? 'siliguri' : 'kalpurush');
    document.getElementById('font-text').innerText = isSiliguri ? "কালপুরুষ ফন্ট" : "শিলিগুড়ি ফন্ট";
}

function setFilter(type, el) {
    currentFilter = type;
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    el.classList.add('active');
    render();
}

function openModal() { document.getElementById('modal').style.display = 'flex'; document.getElementById('date-input').valueAsDate = new Date(); }
function closeModal() { document.getElementById('modal').style.display = 'none'; }

function addTransaction(type) {
    const reason = document.getElementById('reason').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const date = document.getElementById('date-input').value;
    if(!reason || !amount) return;
    transactions.push({ id: Date.now(), reason, amount: type === 'income' ? amount : -amount, date, type });
    saveAndRender(); closeModal();
    document.getElementById('reason').value = ''; document.getElementById('amount').value = '';
}

function deleteToTrash(id) {
    const idx = transactions.findIndex(t => t.id === id);
    if(idx > -1) { trash.push(transactions.splice(idx, 1)[0]); saveAndRender(); }
}

function restoreFromTrash(id) {
    const idx = trash.findIndex(t => t.id === id);
    transactions.push(trash.splice(idx, 1)[0]);
    saveAndRender(); showTrash();
}

function permanentDelete(id) {
    if(confirm("চিরতরে মুছে ফেলবেন?")) {
        trash = trash.filter(t => t.id !== id);
        saveAndRender(); showTrash();
    }
}

function showTrash() {
    const list = document.getElementById('history-list');
    document.getElementById('history-title').innerText = "রিসাইকেল বিন";
    list.innerHTML = trash.length ? '' : '<p style="text-align:center; opacity:0.5; padding:20px;">বিন খালি!</p>';
    trash.slice().reverse().forEach(t => {
        const li = document.createElement('li');
        li.innerHTML = `<div><b>${t.reason}</b><br><small>৳ ${toBengali(Math.abs(t.amount))}</small></div>
        <div style="text-align:right"><button onclick="restoreFromTrash(${t.id})" style="color:var(--income); border:none; background:none; cursor:pointer;">ফিরিয়ে আনুন</button><br>
        <button onclick="permanentDelete(${t.id})" style="color:var(--expense); border:none; background:none; cursor:pointer;">মুছুন</button></div>`;
        list.appendChild(li);
    });
    const backBtn = document.createElement('button');
    backBtn.innerText = "ফিরে যান";
    backBtn.style.cssText = "width:100%; padding:10px; margin-top:10px; background:var(--accent); color:white; border:none; border-radius:10px;";
    backBtn.onclick = render;
    list.appendChild(backBtn);
}

function exportData() {
    const data = { transactions, trash, userName: localStorage.getItem('user-name') };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `asifio_backup_${new Date().toLocaleDateString()}.json`;
    a.click();
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            if (confirm("সব তথ্য রিস্টোর করবেন?")) {
                transactions = imported.transactions || [];
                trash = imported.trash || [];
                if(imported.userName) localStorage.setItem('user-name', imported.userName);
                saveAndRender();
                alert("রিস্টোর সফল!");
                window.location.reload();
            }
        } catch (err) { alert("ভুল ফাইল!"); }
    };
    reader.readAsText(file);
}

function setupSwipe() {
    document.querySelectorAll('li[data-id]').forEach(item => {
        let startX;
        item.addEventListener('touchstart', e => startX = e.touches[0].clientX, {passive: true});
        item.addEventListener('touchmove', e => {
            let diff = startX - e.touches[0].clientX;
            if (diff > 0) item.style.transform = `translateX(-${diff}px)`;
        }, {passive: true});
        item.addEventListener('touchend', e => {
            let diff = startX - e.changedTouches[0].clientX;
            if (diff > 120) {
                item.style.transform = 'translateX(-100%)';
                setTimeout(() => deleteToTrash(Number(item.dataset.id)), 200);
            } else { item.style.transform = 'translateX(0)'; }
        });
    });
}

function render() {
    const list = document.getElementById('history-list');
    const fMonth = document.getElementById('filter-month');
    const fYear = document.getElementById('filter-year');
    if(!list || !fMonth || !fYear) return;
    
    const selM = parseInt(fMonth.value);
    const selY = parseInt(fYear.value);
    document.getElementById('history-title').innerText = "সাম্প্রতিক লেনদেন";
    list.innerHTML = '';
    let total = 0, inc = 0, exp = 0;

    const filtered = transactions.filter(t => {
        const d = new Date(t.date);
        const matchDate = d.getMonth() === selM && d.getFullYear() === selY;
        if(matchDate) {
            total += t.amount;
            if(t.amount > 0) inc += t.amount; else exp += Math.abs(t.amount);
        }
        return matchDate && (currentFilter === 'all' || t.type === currentFilter);
    });

    document.getElementById('total-balance').innerText = `৳ ${toBengali(total)}`;
    document.getElementById('total-inc').innerText = `৳ ${toBengali(inc)}`;
    document.getElementById('total-exp').innerText = `৳ ${toBengali(exp)}`;

    filtered.slice().reverse().forEach(t => {
        const container = document.createElement('div');
        container.className = 'swipe-item';
        container.innerHTML = `<div style="position:absolute; right:20px; top:50%; transform:translateY(-50%); color:white; font-size:0.8rem;">মুছে যাচ্ছে...</div>`;
        const li = document.createElement('li');
        li.className = t.type === 'income' ? 'item-in' : 'item-out';
        li.dataset.id = t.id;
        li.innerHTML = `<div><b>${t.reason}</b><br><small>${toBengali(t.date)}</small></div>
        <div style="text-align:right"><span style="color:${t.type === 'income' ? 'var(--income)' : 'var(--expense)'}">৳ ${toBengali(Math.abs(t.amount))}</span></div>`;
        container.appendChild(li); list.appendChild(container);
    });
    setupSwipe();
}

function saveAndRender() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('trash', JSON.stringify(trash));
    
    const user = auth.currentUser;
    if (user && navigator.onLine) {
        db.ref("users/" + user.uid).set({
            transactions: transactions, trash: trash, lastUpdated: Date.now()
        });
    }
    render();
}


// ৫. ইন্টারনেট সিঙ্ক ও ইনিশিয়েলাইজেশন
window.addEventListener('online', () => { if (auth.currentUser) saveAndRender(); });

document.addEventListener('click', (e) => {
    const box = document.getElementById('auth-box');
    const trigger = document.getElementById('user-trigger');
    if (box && trigger && !box.contains(e.target) && !trigger.contains(e.target)) box.style.display = 'none';
});

window.onload = () => {
    initFilters();
    const savedName = localStorage.getItem('user-name') || "আসিফ ইকবাল";
    document.getElementById('display-name').innerText = `আয় ব্যয় - ${savedName}`;
    const isDark = (localStorage.getItem('theme') || 'dark') === 'dark';
    document.body.classList.toggle('Dark-Asifio', isDark);
    updateThemeUI(isDark);
    if(localStorage.getItem('font-pref') === 'siliguri') document.body.classList.add('font-siliguri');
    
    auth.onAuthStateChanged(user => {
        if (user) {
            updateAuthUI(user);
            syncWithCloud(user);
        } else {
            updateAuthUI(null);
            // যদি ইউজার ব্রাউজারে থাকে এবং পপ-আপ আসে, তবে লগইন পপ-আপকে ৩ সেকেন্ড দেরি করানো
            setTimeout(() => {
                if(!auth.currentUser && !window.matchMedia('(display-mode: standalone)').matches) {
                   // confirmLogin(); // অটো লগইন পপআপ অপশনাল রাখতে পারেন
                }
            }, 5000);
        }
    });
    render();
};
            
