const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const monthsBN = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
const toBengali = n => n.toString().replace(/\d/g, d => bengaliDigits[d]);

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let trash = JSON.parse(localStorage.getItem('trash')) || [];
let currentFilter = 'all';

function initFilters() {
    const mSelect = document.getElementById('filter-month');
    const ySelect = document.getElementById('filter-year');
    const now = new Date();
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
    if (isDark) {
        themeText.innerText = "লাইট মোড";
        themeIcon.innerHTML = `<svg viewBox="0 0 24 24"><path d="M12 18.5C15.5899 18.5 18.5 15.5899 18.5 12C18.5 8.41015 15.5899 5.5 12 5.5C8.41015 5.5 5.5 8.41015 5.5 12C5.5 15.5899 8.41015 18.5 12 18.5Z"></path><path d="M19.14 19.14L19.01 19.01M19.01 4.99L19.14 4.86L19.01 4.99ZM4.86 19.14L4.99 19.01L4.86 19.14ZM12 2.08V2V2.08ZM12 22V21.92V22ZM2.08 12H2H2.08ZM22 12H21.92H22ZM4.99 4.99L4.86 4.86L4.99 4.99Z"></path></svg>`;
    } else {
        themeText.innerText = "ডার্ক মোড";
        themeIcon.innerHTML = `<svg viewBox="0 0 24 24"><path d="M2.03009 12.42C2.39009 17.57 6.76009 21.76 11.9901 21.99C15.6801 22.15 18.9801 20.43 20.9601 17.72C21.7801 16.61 21.3401 15.87 19.9701 16.12C19.3001 16.24 18.6101 16.29 17.8901 16.26C13.0001 16.06 9.00009 11.97 8.98009 7.13996C8.97009 5.83996 9.24009 4.60996 9.73009 3.48996C10.2701 2.24996 9.62009 1.65996 8.37009 2.18996C4.41009 3.85996 1.70009 7.84996 2.03009 12.42Z"></path></svg>`;
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
        li.style.borderLeft = "4px solid #888";
        li.innerHTML = `<div><b>${t.reason}</b><br><small>৳ ${toBengali(Math.abs(t.amount))}</small></div>
        <div style="text-align:right"><button onclick="restoreFromTrash(${t.id})" style="color:var(--income); border:none; background:none; font-size:0.8rem; cursor:pointer;">ফিরিয়ে আনুন</button><br>
        <button onclick="permanentDelete(${t.id})" style="color:var(--expense); border:none; background:none; font-size:0.8rem; cursor:pointer;">মুছুন</button></div>`;
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
    toggleDrawer();
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            if (confirm("বর্তমান তথ্য মুছে নতুন তথ্য রিস্টোর করবেন?")) {
                transactions = imported.transactions || [];
                trash = imported.trash || [];
                if(imported.userName) localStorage.setItem('user-name', imported.userName);
                saveAndRender();
                alert("রিস্টোর সফল হয়েছে!");
                window.location.reload();
            }
        } catch (err) { alert("ভুল ফাইল সিলেক্ট করেছেন!"); }
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
    const selM = parseInt(document.getElementById('filter-month').value);
    const selY = parseInt(document.getElementById('filter-year').value);
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
    render();
}

window.onload = () => {
    initFilters();
    const savedName = localStorage.getItem('user-name') || "আসিফ ইকবাল";
    document.getElementById('display-name').innerText = `আয় ব্যয় - ${savedName}`;
    const isDark = (localStorage.getItem('theme') || 'dark') === 'dark';
    document.body.classList.toggle('Dark-Asifio', isDark);
    updateThemeUI(isDark);
    if(localStorage.getItem('font-pref') === 'siliguri') toggleFont();
    render();
};
