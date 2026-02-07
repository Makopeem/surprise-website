// --- CONFIG ---
const PASSCODE = "2004";
const START_DATE = new Date("2025-10-08T00:00:00"); // Start date Oct 8, 2025

// --- NAVIGATION ---
function nextView(viewId) {
    // Hide all views & Pause videos
    document.querySelectorAll('.view').forEach(el => {
        el.classList.add('hidden');
        el.classList.remove('active');
        // Pause any videos in this view
        const video = el.querySelector('video');
        if (video) video.pause();
    });

    // Show target view
    const target = document.getElementById(viewId);
    target.classList.remove('hidden');
    target.classList.add('active');

    // Init specific logic if needed
    if (viewId === 'view-calendar') startTimer();
    if (viewId === 'view-game') initGame();

    // Auto-play video in memories
    if (viewId === 'view-memories') {
        const vid = target.querySelector('video');
        if (vid) vid.play().catch(e => console.log("Auto-play prevented:", e));
    }
}

// --- LOGIN LOGIC ---
let currentInput = "";
const dots = [document.getElementById('dot-1'), document.getElementById('dot-2'), document.getElementById('dot-3'), document.getElementById('dot-4')];

function addDigit(digit) {
    if (currentInput.length < 4) {
        currentInput += digit;
        updateDots();

        if (currentInput.length === 4) {
            checkPasscode();
        }
    }
}

function clearDigits() {
    currentInput = "";
    updateDots();
    document.getElementById('error-msg').classList.add('hidden');
}

function updateDots() {
    dots.forEach((dot, index) => {
        if (index < currentInput.length) {
            dot.classList.add('filled');
        } else {
            dot.classList.remove('filled');
        }
    });
}

function checkPasscode() {
    if (currentInput === PASSCODE) {
        setTimeout(() => {
            nextView('view-dashboard');
            clearDigits();
        }, 300);
    } else {
        document.getElementById('error-msg').classList.remove('hidden');
        setTimeout(clearDigits, 1000);
    }
}

// --- CALENDAR LOGIC ---
let timerInterval;

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);

    function update() {
        const now = new Date();
        const diff = now - START_DATE;

        if (diff < 0) {
            // Future date case
            document.getElementById('days').innerText = "0";
            return;
        }

        const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
        const months = Math.floor((diff % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44));
        const days = Math.floor((diff % (1000 * 60 * 60 * 24 * 30.44)) / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        document.getElementById('years').innerText = years;
        document.getElementById('months').innerText = months;
        document.getElementById('days').innerText = days;
        document.getElementById('hours').innerText = hours;
        document.getElementById('minutes').innerText = minutes;
        document.getElementById('seconds').innerText = seconds;
    }

    update();
    timerInterval = setInterval(update, 1000);
}



// --- GAME LOGIC ---
function initGame() {
    const board = document.getElementById('puzzle-board');
    const container = document.getElementById('pieces-container');

    // Clear previous
    board.innerHTML = "";
    container.innerHTML = "";

    // create 9 drop zones
    for (let i = 0; i < 9; i++) {
        let zone = document.createElement('div');
        zone.classList.add('drop-zone');
        zone.dataset.index = i;
        zone.ondragover = e => e.preventDefault();
        zone.ondrop = handleDrop;
        board.appendChild(zone);
    }

    // create 9 pieces shuffled
    let indices = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    indices.sort(() => Math.random() - 0.5);

    indices.forEach(i => {
        let piece = document.createElement('div');
        piece.classList.add('piece');
        piece.draggable = true;
        piece.id = `piece-${i}`;
        piece.dataset.index = i; // Correct position

        // Calculate background position for 3x3 grid
        // 0 1 2
        // 3 4 5
        // 6 7 8
        let row = Math.floor(i / 3);
        let col = i % 3;
        piece.style.backgroundPosition = `-${col * 100}px -${row * 100}px`;

        piece.ondragstart = e => {
            e.dataTransfer.setData('text/plain', piece.id);
        };
        container.appendChild(piece);
    });
}

function handleDrop(e) {
    e.preventDefault();
    const pieceId = e.dataTransfer.getData('text/plain');
    const piece = document.getElementById(pieceId);

    // Drop into Drop Zone (only if empty)
    if (e.target.classList.contains('drop-zone') && e.target.children.length === 0) {
        e.target.appendChild(piece);
        checkWin();
    }
    // Drop back into Container
    else if (e.target.id === 'pieces-container' || e.target.closest('#pieces-container')) {
        document.getElementById('pieces-container').appendChild(piece);
    }
}

function checkWin() {
    const zones = document.querySelectorAll('.drop-zone');
    let correct = 0;
    zones.forEach(zone => {
        if (zone.children.length > 0) {
            let piece = zone.children[0];
            if (zone.dataset.index == piece.dataset.index) {
                correct++;
            }
        }
    });

    if (correct === 9) {
        document.getElementById('game-success').classList.remove('hidden');
    }
}

// --- MESSAGE LOGIC ---
function openEnvelope() {
    document.querySelector('.envelope').classList.toggle('open');
    // Show manual letter read after animation
    setTimeout(() => {
        document.getElementById('letter-modal').classList.remove('hidden');
    }, 1000);
}
// --- FLOATING HEARTS ---
function createFloatingHearts() {
    const container = document.body;

    // Create a heart every 500ms
    setInterval(() => {
        const heart = document.createElement('div');
        heart.classList.add('floating-heart');
        heart.innerHTML = '❤️';

        // Random Position
        heart.style.left = Math.random() * 100 + 'vw';

        // Random Animation Duration (5s to 10s)
        heart.style.animationDuration = (Math.random() * 5 + 5) + 's';

        // Random Size (20px to 40px)
        heart.style.fontSize = (Math.random() * 20 + 20) + 'px';

        container.appendChild(heart);

        // Remove after animation (10s max)
        setTimeout(() => {
            heart.remove();
        }, 10000);
    }, 500);
}

// --- DASHBOARD CLOCK ---
function updateDashboardClock() {
    const clockElement = document.getElementById('dashboard-clock');
    if (clockElement) {
        const now = new Date();
        clockElement.innerText = now.toLocaleTimeString();
    }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    createFloatingHearts();
    setInterval(updateDashboardClock, 1000); // Update every second
    updateDashboardClock(); // Initial call
});
