const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const leaderboardFilePath = './leaderboard.json';

function readLeaderboard() {
    try {
        if (fs.existsSync(leaderboardFilePath)) {
            const data = fs.readFileSync(leaderboardFilePath);
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error reading leaderboard file:', error);
    }
    return [];
}

function writeLeaderboard(data) {
    try {
        fs.writeFileSync(leaderboardFilePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error writing to leaderboard file:', error);
    }
}

app.get('/leaderboard', (req, res) => {
    const leaderboard = readLeaderboard();
    res.json(leaderboard);
});

app.post('/leaderboard', (req, res) => {
    const { name, score } = req.body;
    if (name && typeof score === 'number') {
        const leaderboard = readLeaderboard();
        leaderboard.push({ name, score });
        leaderboard.sort((a, b) => b.score - a.score);
        const top5 = leaderboard.slice(0, 5);
        writeLeaderboard(top5);
        res.status(201).json({ message: 'Score saved.' });
    } else {
        res.status(400).json({ message: 'Invalid data.' });
    }
});

app.listen(port, () => {
    console.log(`Leaderboard server listening at http://localhost:${port}`);
});
