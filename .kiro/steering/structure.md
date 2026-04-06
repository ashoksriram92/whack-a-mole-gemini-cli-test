# Project Structure

## Root Layout

```
whack-a-mole-gemini-cli-test/
├── index.html             # Game UI (player setup, grid, leaderboard)
├── script.js              # All frontend game logic and API calls
├── style.css              # All styles (earthy theme, responsive)
├── README.md              # Project overview and setup instructions
├── .gitignore             # Ignores node_modules, .aws-sam, leaderboard.json
└── aws/                   # Serverless backend (AWS SAM)
    ├── template.yaml      # SAM template (API Gateway, Lambda, DynamoDB)
    ├── samconfig.toml      # SAM CLI deployment config (us-east-1, stack: whack-a-mole)
    └── src/handlers/       # Lambda function source code
        ├── add-score.js        # POST /leaderboard handler
        ├── get-scores.js       # GET /leaderboard handler
        ├── add-score.test.js   # Jest tests for add-score
        ├── get-scores.test.js  # Jest tests for get-scores
        ├── package.json        # Node.js dependencies
        ├── package-lock.json   # Locked dependency versions
        └── Makefile            # SAM build targets (install, test, copy artifacts)
```

## Frontend (Root Directory)

The frontend is three static files with no build step, no framework, and no bundler:

- `index.html` - Single page with three sections: player name input, game container (hidden until name is submitted), and leaderboard container
- `script.js` - Wrapped in a `DOMContentLoaded` listener. Handles mole spawning, click/touch events, countdown timer, score tracking, and REST API calls (`fetch`) to the leaderboard endpoint
- `style.css` - Uses `StyleSheet`-style organization with a responsive media query for mobile

### Frontend Data Flow

```
User clicks mole -> handleHit() -> score++ -> (on game over) saveScore()
saveScore() -> fetch POST /leaderboard -> updateLeaderboard()
updateLeaderboard() -> fetch GET /leaderboard -> render <li> elements
```

## Backend (aws/ Directory)

The backend is an AWS SAM application with two Lambda functions sharing a single DynamoDB table.

### Lambda Functions

| Function | File | HTTP Method | Description |
|----------|------|-------------|-------------|
| AddScoreFunction | `add-score.js` | POST /leaderboard | Validates input, generates UUID, writes score to DynamoDB |
| GetScoresFunction | `get-scores.js` | GET /leaderboard | Scans table, sorts by score descending, returns top 5 |

### SAM Template Resources

| Resource | Type | Purpose |
|----------|------|---------|
| LeaderboardTable | SimpleTable | DynamoDB table (`WhackAMoleLeaderboard`) with `id` (String) primary key |
| GetScoresFunction | Serverless::Function | Lambda for retrieving scores (DynamoDBReadPolicy) |
| AddScoreFunction | Serverless::Function | Lambda for saving scores (DynamoDBCrudPolicy) |
| ServerlessRestApi | (implicit) | API Gateway with CORS configured for GitHub Pages origin |

### Build Process (Makefile)

Each Lambda function has a Makefile target that:
1. Cleans `node_modules`
2. Runs `npm install`
3. Runs `npm test` (Jest)
4. Copies the handler JS file to `$(ARTIFACTS_DIR)`

This is triggered by `sam build` via the `BuildMethod: makefile` metadata in `template.yaml`.

## Key Conventions

- No build tools or bundler for the frontend -- edit files directly and refresh the browser
- Backend dependencies live only in `aws/src/handlers/package.json`, not at the project root
- CORS origin is hardcoded in both the SAM template (preflight) and each Lambda response (runtime)
- The API URL is hardcoded in `script.js` as the `apiUrl` constant
- DynamoDB table name defaults to `WhackAMoleLeaderboard` via environment variable fallback
