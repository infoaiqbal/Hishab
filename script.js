const display = document.getElementById('display');
const body = document.body;
const darkIcon = document.getElementById('dark-icon');
const lightIcon = document.getElementById('light-icon');

function appendToDisplay(input) {
    display.value += input;
}

function clearDisplay() {
    display.value = "";
}

function deleteLast() {
    display.value = display.value.slice(0, -1);
}

function calculate() {
    try {
        display.value = eval(display.value);
    } catch (error) {
        display.value = "Error";
    }
}

function toggleTheme() {
    if (body.classList.contains('Dark-Asifio')) {
        body.classList.remove('Dark-Asifio');
        darkIcon.style.display = 'block';
        lightIcon.style.display = 'none';
        localStorage.setItem('theme', 'light');
    } else {
        body.classList.add('Dark-Asifio');
        darkIcon.style.display = 'none';
        lightIcon.style.display = 'block';
        localStorage.setItem('theme', 'dark');
    }
}

window.onload = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        body.classList.remove('Dark-Asifio');
        darkIcon.style.display = 'block';
        lightIcon.style.display = 'none';
    } else {
        body.classList.add('Dark-Asifio');
        darkIcon.style.display = 'none';
        lightIcon.style.display = 'block';
    }
};
