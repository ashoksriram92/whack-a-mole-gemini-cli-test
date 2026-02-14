document.addEventListener('DOMContentLoaded', () => {

    const squares = document.querySelectorAll('.square');
    const scoreDisplay = document.getElementById('score');
    const timeLeftDisplay = document.getElementById('time-left');
    const startButton = document.getElementById('start-button');

    let score = 0;
    let timeLeft = 60;
    let hitPosition;
    let timerId = null;
    let moleTimerId = null;
    let gameInProgress = false;

    function randomSquare() {
        squares.forEach(square => {
            square.classList.remove('mole', 'up');
            // Add a simple mole placeholder for now
            const moleElement = square.querySelector('.mole');
            if (moleElement) {
                square.removeChild(moleElement);
            }
        });

        let randomPosition = squares[Math.floor(Math.random() * 9)];
        
        // Use a div for the mole for now
        const moleElement = document.createElement('div');
        moleElement.classList.add('mole', 'up');
        randomPosition.appendChild(moleElement);

        hitPosition = randomPosition.id;
    }

    squares.forEach(square => {
        square.addEventListener('mousedown', () => {
            if (gameInProgress && square.id === hitPosition) {
                score++;
                scoreDisplay.textContent = score;
                square.classList.remove('up');
                hitPosition = null; // Prevent multiple hits on the same mole
            }
        });
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

});