# Whack-a-Mole - Product Overview

Whack-a-Mole is a browser-based arcade game with a persistent universal leaderboard. Players enter their name, then try to click moles as they pop up from a 3x3 grid within a 60-second time limit.

## Game Mechanics

| Concept | Detail |
|---------|--------|
| Grid | 3x3 grid of squares (holes) |
| Mole spawn rate | Every 700ms a mole appears in a random square |
| Game duration | 60 seconds countdown |
| Scoring | +1 point per successful hit |
| Max plausible score | 90 (enforced server-side) |
| Player name | Required before playing, max 15 characters |
| Input | Mouse click (`mousedown`) and touch (`touchstart`) supported |

## Key User Flows

### 1. Player Setup
- User enters their name (max 15 characters) and clicks Submit
- Name input is hidden and the game board is revealed

### 2. Gameplay
- User clicks "Start Game" to begin the 60-second countdown
- Moles pop up in random squares every 700ms with a CSS transition animation
- Clicking a mole increments the score; the mole disappears
- Start button is disabled during gameplay

### 3. Game Over
- When the timer reaches zero, an alert displays the final score
- The score is automatically saved to the leaderboard via POST to the API
- The leaderboard refreshes to show updated rankings

### 4. Leaderboard
- Displays the top 5 scores across all players and sessions
- Loaded on page load and refreshed after each game
- Scores are sorted server-side by score descending
- Shown as an ordered list below the game grid

## Hosting

- Frontend hosted on GitHub Pages: `https://ashoksriram92.github.io/whack-a-mole-gemini-cli-test/`
- Backend API on AWS API Gateway: `https://sg5om8nni4.execute-api.us-east-1.amazonaws.com/Prod/leaderboard`
- CORS is configured to allow requests only from the GitHub Pages origin

## Visual Design

- Earthy, outdoor color palette
- Background: light green (`#c0d9af`)
- Grid and leaderboard: brown tones (`#a08464`, `#7a6344`, `#534431`)
- Mole: tan circle (`#be9767`) with brown border, animates up/down via CSS transition
- Responsive layout with media query for screens under 600px
