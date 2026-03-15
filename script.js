const display = document.getElementById('display');
const body = document.body;
const darkIcon = document.getElementById('dark-icon');
const lightIcon = document.getElementById('light-icon');

// Calculator Functions
function appendToDisplay(input) { display.value += input; }
function clearDisplay() { display.value = ""; }
function deleteLast() { display.value = display.value.slice(0, -1); }
function calculate() {
    try { display.value = eval(display.value); }
    catch (e) { display.value = "Error"; }
}

// Tab Switching Logic
function showSection(section) {
    const calcSec = document.getElementById('calculator-section');
    const convSec = document.getElementById('converter-section');
    const calcBtn = document.getElementById('calc-btn');
    const convBtn = document.getElementById('conv-btn');

    if (section === 'calc') {
        calcSec.style.display = 'block';
        convSec.style.display = 'none';
        calcBtn.classList.add('active-tab');
        convBtn.classList.remove('active-tab');
    } else {
        calcSec.style.display = 'none';
        convSec.style.display = 'block';
        convBtn.classList.add('active-tab');
        calcBtn.classList.remove('active-tab');
    }
}

// Unit Converter Logic
function convert() {
    const type = document.getElementById('conv-type').value;
    const val = parseFloat(document.getElementById('conv-input').value);
    const resText = document.getElementById('result-text');

    if (isNaN(val)) { resText.innerText = "Result: 0"; return; }

    let result = 0;
    if (type === 'length') {
        result = (val * 0.621371).toFixed(2) + " Miles";
    } else if (type === 'weight') {
        result = (val * 2.20462).toFixed(2) + " Lbs";
    } else if (type === 'temp') {
        result = ((val * 9/5) + 32).toFixed(2) + " °F";
    }
    resText.innerText = "Result: " + result;
}

// Theme Toggle with Persistence
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
};
