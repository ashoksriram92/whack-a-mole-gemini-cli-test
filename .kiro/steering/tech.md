# Tech Stack

## Frontend

- **Vanilla HTML5, CSS3, JavaScript (ES6+)** -- no frameworks, no transpilation, no bundler
- Uses `fetch` API for HTTP requests (async/await)
- CSS transitions for mole pop-up animation
- Responsive design via CSS media queries
- Touch events supported (`touchstart` with `preventDefault` to avoid ghost clicks)

## Backend

- **AWS SAM** (Serverless Application Model) for infrastructure-as-code
- **AWS API Gateway** -- REST API with CORS support
- **AWS Lambda** -- Node.js 18.x runtime, two functions:
  - `add-score.js` -- validates input, generates UUID, writes to DynamoDB via `PutItemCommand`
  - `get-scores.js` -- scans table, sorts, returns top 5 via `ScanCommand`
- **Amazon DynamoDB** -- single table (`WhackAMoleLeaderboard`), provisioned at 1 RCU / 1 WCU
- **Dependencies** (in `aws/src/handlers/package.json`):
  - `uuid` ^9.0.0 -- generating unique score IDs
  - `@aws-sdk/client-dynamodb` ^3.509.0 -- DynamoDB client (dev dependency, provided by Lambda runtime)
  - `@aws-sdk/util-dynamodb` ^3.509.0 -- marshall/unmarshall helpers (dev dependency)

## Testing

- **Jest** ^29.0.0 -- unit tests for Lambda handlers
- **aws-sdk-client-mock** ^3.0.0 -- mocks for DynamoDB client in tests
- Tests are co-located with handlers: `add-score.test.js`, `get-scores.test.js`
- Tests run as part of the SAM build process (Makefile targets)

## Deployment

### Frontend
- Hosted on **GitHub Pages** at `https://ashoksriram92.github.io/whack-a-mole-gemini-cli-test/`
- No build step required -- push static files to the repo

### Backend
- Deployed via **AWS SAM CLI** to `us-east-1`
- Stack name: `whack-a-mole`
- S3 bucket auto-resolved for deployment artifacts

## Common Commands

```bash
# Frontend -- local development
python3 -m http.server              # Serve frontend at http://localhost:8000

# Backend -- tests
cd aws/src/handlers
npm install                         # Install dependencies
npm test                            # Run Jest unit tests

# Backend -- build and deploy (requires AWS CLI + SAM CLI)
cd aws
sam build                           # Build Lambda functions (runs npm install + tests via Makefile)
sam deploy --guided                 # Deploy to AWS (first time, interactive)
sam deploy                          # Deploy to AWS (subsequent, uses samconfig.toml)
```

## Environment Configuration

| Setting | Value |
|---------|-------|
| AWS Region | us-east-1 |
| DynamoDB Table | WhackAMoleLeaderboard |
| API Gateway Stage | Prod |
| CORS Allowed Origin | `https://ashoksriram92.github.io/whack-a-mole-gemini-cli-test/` |
| Lambda Timeout | 3 seconds |
| API URL (in script.js) | `https://sg5om8nni4.execute-api.us-east-1.amazonaws.com/Prod/leaderboard` |
