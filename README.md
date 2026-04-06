# Whack-a-Mole

A classic browser-based Whack-a-Mole arcade game with a persistent universal leaderboard. Whack moles as they pop up from a 3x3 grid, rack up points, and compete for a spot on the global top 5.

**[Play the live game](https://ashoksriram92.github.io/whack-a-mole-gemini-cli-test/)**

---

## Game Mechanics

| Mechanic | Detail |
|----------|--------|
| Grid | 3x3 grid of holes |
| Mole spawn rate | One mole every 700ms in a random hole |
| Game duration | 60-second countdown |
| Scoring | +1 point per successful hit |
| Max score | 90 (enforced server-side) |
| Player name | Required before playing, max 15 characters |
| Input | Mouse (`mousedown`) and touch (`touchstart`) supported |

### How to Play

1. Enter your name (up to 15 characters) and click **Submit**.
2. Click **Start Game** to begin the 60-second countdown.
3. Click or tap moles as they pop up from the holes.
4. When the timer hits zero, your score is saved to the leaderboard automatically.
5. Check the leaderboard to see if you made the top 5!

---

## Architecture

The frontend is three static files served from GitHub Pages. The backend is a serverless AWS application that stores and retrieves leaderboard scores.

```
Browser (HTML/CSS/JS)
    |
    |  fetch() over HTTPS
    v
API Gateway (REST)
    |
    +--> GET  /leaderboard --> GetScoresFunction (Lambda) --> DynamoDB [Scan + Sort]
    |
    +--> POST /leaderboard --> AddScoreFunction  (Lambda) --> DynamoDB [PutItem]
```

### API Endpoints

| Method | Path | Description | Lambda Handler |
|--------|------|-------------|----------------|
| `GET` | `/leaderboard` | Retrieve top 5 scores (sorted descending) | `get-scores.js` |
| `POST` | `/leaderboard` | Save a new score (validates name and score range) | `add-score.js` |

Both endpoints return JSON with CORS headers configured for the GitHub Pages origin.

---

## Project Structure

```
whack-a-mole-gemini-cli-test/
├── index.html                  # Game UI (player setup, grid, leaderboard)
├── script.js                   # Frontend game logic and API calls
├── style.css                   # Styles (earthy theme, responsive)
├── README.md
├── .gitignore
└── aws/                        # Serverless backend (AWS SAM)
    ├── template.yaml           # SAM template (API Gateway, Lambda, DynamoDB)
    ├── samconfig.toml           # SAM CLI deployment config
    └── src/handlers/
        ├── add-score.js         # POST /leaderboard handler
        ├── get-scores.js        # GET /leaderboard handler
        ├── add-score.test.js    # Jest tests for add-score
        ├── get-scores.test.js   # Jest tests for get-scores
        ├── package.json         # Node.js dependencies
        ├── package-lock.json    # Locked dependency versions
        └── Makefile             # SAM build targets
```

---

## Getting Started

### Prerequisites

- Python 3 (for local frontend server) or any static file server
- An AWS account (for backend deployment)
- [AWS CLI](https://aws.amazon.com/cli/) installed and configured
- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html) installed
- Node.js 18.x (for running backend tests locally)

### Run the Frontend Locally

No build step required. Serve the static files and open your browser:

```bash
cd whack-a-mole-gemini-cli-test
python3 -m http.server
```

Then open [http://localhost:8000](http://localhost:8000).

> **Note:** The leaderboard requires the deployed backend API. Without it, the game still plays but scores won't persist.

### Deploy the Backend

1. Navigate to the `aws/` directory:

   ```bash
   cd aws
   ```

2. Build the SAM application (this installs dependencies, runs tests, and packages the Lambda functions):

   ```bash
   sam build
   ```

3. Deploy to AWS (first time, interactive):

   ```bash
   sam deploy --guided
   ```

   For subsequent deployments (uses saved config in `samconfig.toml`):

   ```bash
   sam deploy
   ```

4. Copy the `ApiUrl` from the deployment output and update the `apiUrl` constant in `script.js`:

   ```js
   const apiUrl = 'https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/Prod/leaderboard';
   ```

---

## Testing

Unit tests for the Lambda handlers use Jest and `aws-sdk-client-mock`:

```bash
cd aws/src/handlers
npm install
npm test
```

Tests are also run automatically as part of `sam build` via the Makefile build targets.

---

## Tech Stack

### Frontend

- **Vanilla HTML5, CSS3, JavaScript (ES6+)** -- no frameworks, no transpilation, no bundler
- `fetch` API with async/await for HTTP requests
- CSS transitions for mole pop-up animation
- Responsive layout with a media query for screens under 600px

### Backend

| Service | Purpose |
|---------|---------|
| AWS SAM | Infrastructure-as-code and deployment |
| API Gateway | REST API with CORS support |
| Lambda (Node.js 18.x) | Request handling and business logic |
| DynamoDB | Score persistence (single table, `WhackAMoleLeaderboard`) |

### Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `uuid` | ^9.0.0 | Generating unique score IDs |
| `@aws-sdk/client-dynamodb` | ^3.509.0 | DynamoDB client (provided by Lambda runtime) |
| `@aws-sdk/util-dynamodb` | ^3.509.0 | Marshall/unmarshall helpers |
| `jest` | ^29.0.0 | Unit testing |
| `aws-sdk-client-mock` | ^3.0.0 | Mocking AWS SDK in tests |

### Visual Design

Earthy, outdoor color palette:

| Element | Color |
|---------|-------|
| Background | Light green `#c0d9af` |
| Grid and leaderboard | Brown `#a08464` |
| Borders | Dark brown `#7a6344` |
| Text and accents | Deep brown `#534431` |
| Mole | Tan `#be9767` with brown border |

---

## Hosting

| Component | URL |
|-----------|-----|
| Frontend (GitHub Pages) | [ashoksriram92.github.io/whack-a-mole-gemini-cli-test](https://ashoksriram92.github.io/whack-a-mole-gemini-cli-test/) |
| Backend API (API Gateway) | `https://sg5om8nni4.execute-api.us-east-1.amazonaws.com/Prod/leaderboard` |

CORS is configured to allow requests only from the GitHub Pages origin.

---

## Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/my-feature`).
3. Make your changes and add tests if applicable.
4. Run tests (`cd aws/src/handlers && npm test`).
5. Submit a pull request.

---

## License

This project does not currently specify a license. Contact the repository owner for usage terms.
