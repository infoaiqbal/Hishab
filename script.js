const body = document.body;
const darkIcon = document.getElementById('dark-icon');
const lightIcon = document.getElementById('light-icon');
const historyList = document.getElementById('history-list');
const balanceDisplay = document.getElementById('total-balance');

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

function addTransaction(type) {
    const reason = document.getElementById('reason').value;
    const amount = parseFloat(document.getElementById('amount').value);

    if (!reason || isNaN(amount)) {
        alert("সঠিক তথ্য দিন!");
        return;
    }

    const transaction = {
        id: Date.now(),
        reason,
        amount: type === 'income' ? amount : -amount,
        type
    };

    transactions.push(transaction);
    saveAndRender();
    document.getElementById('reason').value = '';
    document.getElementById('amount').value = '';
}

function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveAndRender();
}

function saveAndRender() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    render();
}

function render() {
    historyList.innerHTML = '';
    let total = 0;

    transactions.slice().reverse().forEach(t => {
        total += t.amount;
        const li = document.createElement('li');
        li.className = t.type === 'income' ? 'item-in' : 'item-out';
        li.innerHTML = `
            <div>
                <strong>${t.reason}</strong><br>
                <small>${new Date(t.id).toLocaleDateString()}</small>
            </div>
            <div style="display:flex; align-items:center;">
                <span style="color: ${t.type === 'income' ? 'var(--in-color)' : 'var(--out-color)'}">
                    ${t.amount > 0 ? '+' : ''}${t.amount}
                </span>
                <button class="delete-btn" onclick="deleteTransaction(${t.id})">×</button>
            </div>
        `;
        historyList.appendChild(li);
    });

    balanceDisplay.innerText = `৳ ${total}`;
}

function toggleTheme() {
    if (body.classList.contains('Dark-Asifio')) {
        body.classList.remove('Dark-Asifio');
        darkIcon.style.display = 'block'; lightIcon.style.display = 'none';
        localStorage.setItem('theme', 'light');
    } else {
        body.classList.add('Dark-Asifio');
        darkIcon.style.display = 'none'; lightIcon.style.display = 'block';
        localStorage.setItem('theme', 'dark');
    }
}

window.onload = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        body.classList.remove('Dark-Asifio');
        darkIcon.style.display = 'block'; lightIcon.style.display = 'none';
    } else {
        body.classList.add('Dark-Asifio');
        darkIcon.style.display = 'none'; lightIcon.style.display = 'block';
    }
    render();
};
