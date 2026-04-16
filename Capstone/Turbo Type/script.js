const carStartPos = 40;
const finishLinePos = 820;

const difficultySettings = {
    easy: { 
        botWpm: 30, 
        texts: [
            "The road is long, and the car is small. It moves slow, then fast, then slow again. \"Go!\" I shout, and we start the race. The sun is warm, the air is calm, and the day feels nice. Can we win? Yes, we can!"
        ] 
    },
    medium: { 
        botWpm: 50, 
        texts: [
            "Wait! Do you see that? The racer's engine—it's glowing blue (nitro mode). \"Ready, set, go!\" the flagger yells; suddenly, the tires screech. It's a close race, isn't it? Don't lose focus, keep your hands steady, and—BAM—you take the lead!",
            "Typewriters were loud; however, modern keyboards are much quieter. Do you prefer the 'click-clack' sound, or do you like a silent touch? (I like the noise!) Let's see: can you type 100% correctly while the bot chases you?"
        ] 
    },
    hard: { 
        botWpm: 75, // Slightly lowered to balance the heavy punctuation
        texts: [
            "Precision; it's the difference between a 'Winner' and a 'Runner-up.' Note: accuracy (not just speed) is vital! The engine's roar—a fierce, mechanical growl—echoes through the city; meanwhile, the finish-line looms ahead. Are you ready for the final stretch? \"I am!\" you declare.",
            "Technical mastery—comprising speed, accuracy, and form—is essential for the digital age. (Did you know that?) Shortcuts like 'Ctrl+C' and 'Ctrl+V' are helpful; however, nothing beats raw typing talent. Can you navigate these semicolons; colon: and quotes \"correctly\"?"
        ] 
    }
};

let activeText = "";
let charIdx = 0;
let startTime = null;
let isGameRunning = false;
let botWpm = 25;

const textDisplay = document.getElementById('text-display');
const hiddenInput = document.getElementById('hidden-input');
const playerCar = document.getElementById('player-car');
const botCar = document.getElementById('bot-car');

document.getElementById('start-btn').addEventListener('click', startRace);
document.getElementById('restart-btn').addEventListener('click', () => {
    document.getElementById('end-screen').classList.add('hidden');
    document.getElementById('start-screen').classList.remove('hidden');
    resetPositions();
});

function resetPositions() {
    playerCar.style.left = `${carStartPos}px`;
    botCar.style.left = `${carStartPos}px`;
    document.getElementById('wpm-counter').innerText = "0";
}

function startRace() {
    const mode = document.querySelector('input[name="difficulty"]:checked').value;
    const config = difficultySettings[mode];
    
    botWpm = config.botWpm;
    activeText = config.texts[Math.floor(Math.random() * config.texts.length)];
    charIdx = 0;
    isGameRunning = true;
    
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('end-screen').classList.add('hidden');
    
    renderText();
    hiddenInput.value = "";
    hiddenInput.focus();
    startTime = new Date();
    
    runBot();
}

function renderText() {
    textDisplay.innerHTML = activeText.split('').map((char, i) => 
        `<span class="${i === 0 ? 'current' : ''}">${char}</span>`
    ).join('');
}

hiddenInput.addEventListener('input', () => {
    if (!isGameRunning) return;

    const spans = textDisplay.querySelectorAll('span');
    const typedChar = hiddenInput.value[hiddenInput.value.length - 1];
    const targetChar = activeText[charIdx];

    if (typedChar === targetChar) {
        spans[charIdx].className = "correct";
        charIdx++;
        if (spans[charIdx]) spans[charIdx].className = "current";
        updateProgress();
    } else {
        spans[charIdx].className = "incorrect current";
    }
    
    hiddenInput.value = ""; 

    if (charIdx >= activeText.length) endRace(true);
});

function updateProgress() {
    const progress = charIdx / activeText.length;
    playerCar.style.left = `${carStartPos + (progress * (finishLinePos - carStartPos))}px`;
    
    const elapsed = (new Date() - startTime) / 60000;
    document.getElementById('wpm-counter').innerText = Math.round((charIdx / 5) / elapsed) || 0;
}

function runBot() {
    let botPos = carStartPos;
    const pixelsPerTick = (botWpm * 5) / (60 * 10); 

    const botTimer = setInterval(() => {
        if (!isGameRunning) return clearInterval(botTimer);
        botPos += pixelsPerTick;
        botCar.style.left = `${botPos}px`;
        if (botPos >= finishLinePos) { endRace(false); clearInterval(botTimer); }
    }, 100);
}

function endRace(playerWon) {
    isGameRunning = false;

    const elapsed = (new Date() - startTime) / 60000;
    const finalWpm = Math.round((charIdx / 5) / elapsed) || 0;

    document.getElementById('end-screen').classList.remove('hidden');
    document.getElementById('final-wpm').innerText = finalWpm;

    const msg = document.getElementById('result-message');
    msg.innerText = playerWon ? "🏁 VICTORIOUS!" : "🏎️ BOT WON";
    msg.style.color = playerWon ? "var(--gas-green)" : "var(--nitro-blue)";
}