# Whack-a-Mole Game with Universal Leaderboard

This is a classic Whack-a-Mole game with a twist: a universal leaderboard that persists scores across all players and sessions. The frontend is built with vanilla HTML, CSS, and JavaScript, while the backend is a serverless application running on AWS.

## Architecture

The application uses a serverless architecture on AWS to handle the leaderboard functionality.

| Client (Browser) | API Gateway | Lambda | DynamoDB |
| :---: | :---: | :---: | :---: |
| User plays the game | Receives API requests | Executes business logic | Stores and retrieves scores |
| ⬇️ | ⬇️ | ⬇️ | ⬇️ |
| `POST /leaderboard` (Save Score) | Forwards request to Lambda | `add-score.js` | `PutItem` |
| `GET /leaderboard` (View Scores) | Forwards request to Lambda | `get-scores.js` | `Scan` |


**Flow:**
1.  The user plays the game in their browser.
2.  When a game is over, the score is sent via an HTTPS request to an Amazon API Gateway endpoint.
3.  API Gateway triggers the appropriate AWS Lambda function (`add-score` or `get-scores`).
4.  The Lambda function processes the request, interacts with the Amazon DynamoDB table to store or retrieve scores, and returns a response.
5.  The frontend displays the updated leaderboard.

## Setup and Deployment

### Frontend

To run the frontend, you need a simple local web server.

1.  Navigate to the `whack-a-mole-gemini-cli-test` directory.
2.  Run the following command:
    ```bash
    python3 -m http.server
    ```
3.  Open your browser and go to `http://localhost:8000`.

### Backend

The backend is deployed using the AWS Serverless Application Model (SAM).

1.  **Prerequisites:**
    *   An AWS account.
    *   AWS CLI installed and configured.
    *   AWS SAM CLI installed.

2.  **Deployment:**
    *   Navigate to the `whack-a-mole-gemini-cli-test/aws` directory.
    *   Build the application:
        ```bash
        sam build
        ```
    *   Deploy the application:
        ```bash
        sam deploy --guided
        ```
    *   After deployment, the API Gateway URL will be displayed.

3.  **Update Frontend Configuration:**
    *   Copy the API Gateway URL from the deployment output.
    *   Open `script.js` and replace the placeholder value for the `apiUrl` variable with the copied URL.
