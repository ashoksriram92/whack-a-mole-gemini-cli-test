document.addEventListener('DOMContentLoaded', () => {

    const squares = document.querySelectorAll('.square');
    const scoreDisplay = document.getElementById('score');
    const timeLeftDisplay = document.getElementById('time-left');
    const startButton = document.getElementById('start-button');
    const playerSetup = document.getElementById('player-setup');
    const playerNameInput = document.getElementById('player-name');
    const submitNameButton = document.getElementById('submit-name');
    const gameContainer = document.querySelector('.game-container');
    const leaderboardList = document.getElementById('leaderboard-list');
    const contrastToggle = document.getElementById('contrast-toggle');

    if (localStorage.getItem('highContrast') === 'true') {
        document.body.classList.add('high-contrast');
    }

    contrastToggle.addEventListener('click', () => {
        document.body.classList.toggle('high-contrast');
        const isHighContrast = document.body.classList.contains('high-contrast');
        localStorage.setItem('highContrast', isHighContrast);
    });

    const apiUrl = 'https://sg5om8nni4.execute-api.us-east-1.amazonaws.com/Prod/leaderboard';

    let score = 0;
    let timeLeft = 60;
    let hitPosition;
    let timerId = null;
    let moleTimerId = null;
    let gameInProgress = false;
    let currentPlayer = '';

    async function updateLeaderboard() {
        try {
            const response = await fetch(apiUrl);
            const scores = await response.json();
            
            // Clear old leaderboard
            leaderboardList.innerHTML = '';

            // Create and append new list items safely
            scores.forEach(score => {
                const li = document.createElement('li');
                li.textContent = `${score.name}: ${score.score}`;
                leaderboardList.appendChild(li);
            });
        } catch (error) {
            console.error('Error updating leaderboard:', error);
            leaderboardList.innerHTML = '<li>Could not load leaderboard. Is the server running?</li>';
        }
    }

    async function saveScore(score, name) {
        try {
            await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, score }),
            });
            updateLeaderboard();
        } catch (error) {
            console.error('Error saving score:', error);
        }
    }

    submitNameButton.addEventListener('click', () => {
        const playerName = playerNameInput.value.trim();
        if (playerName) {
            currentPlayer = playerName;
            playerSetup.style.display = 'none';
            gameContainer.style.display = 'block';
        } else {
            alert('Please enter your name.');
        }
    });

    function randomSquare() {
        squares.forEach(square => {
            square.classList.remove('mole', 'up');
            const moleElement = square.querySelector('.mole');
            if (moleElement) {
                square.removeChild(moleElement);
            }
        });

        let randomPosition = squares[Math.floor(Math.random() * 9)];
        
        const moleElement = document.createElement('div');
        moleElement.classList.add('mole', 'up');
        randomPosition.appendChild(moleElement);

        hitPosition = randomPosition.id;
    }

    function handleHit(square) {
        if (gameInProgress && square.id === hitPosition) {
            score++;
            scoreDisplay.textContent = score;
            square.classList.remove('up');
            hitPosition = null; 
        }
    }

    squares.forEach(square => {
        square.addEventListener('mousedown', () => handleHit(square));
        square.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Prevent ghost clicks
            handleHit(square)
        });
    });

    document.addEventListener('keydown', (e) => {
        if (!gameInProgress) return;

        let squareId = null;
        if (e.code.startsWith('Digit')) {
            squareId = e.code.charAt(5);
        } else if (e.code.startsWith('Numpad')) {
            squareId = e.code.charAt(6);
        }

        if (squareId && squareId >= '1' && squareId <= '9') {
            const square = document.getElementById(squareId);
            if (square) {
                handleHit(square);
            }
        }
    });

    function moveMole() {
        moleTimerId = setInterval(randomSquare, 700);
    }
    
    function countDown() {
        timeLeft--;
        timeLeftDisplay.textContent = timeLeft;

        if (timeLeft === 0) {
            clearInterval(timerId);
            clearInterval(moleTimerId);
            gameInProgress = false;
            alert('Game Over! Your final score is ' + score);
            saveScore(score, currentPlayer);
            startButton.disabled = false;
        }
    }

    function startGame() {
        if (gameInProgress) return;

        score = 0;
        timeLeft = 60;
        scoreDisplay.textContent = score;
        timeLeftDisplay.textContent = timeLeft;
        gameInProgress = true;
        startButton.disabled = true;

        timerId = setInterval(countDown, 1000);
        moveMole();
    }

    startButton.addEventListener('click', startGame);

    updateLeaderboard();
});