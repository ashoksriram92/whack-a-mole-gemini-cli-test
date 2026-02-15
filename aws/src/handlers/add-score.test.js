const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { mockClient } = require("aws-sdk-client-mock");
const { handler } = require("./add-score");

jest.mock('uuid', () => ({ v4: () => 'test-uuid' }));

const ddbMock = mockClient(DynamoDBClient);

describe('Add Score Handler', () => {
    beforeEach(() => {
        ddbMock.reset();
    });

    it('should return a 201 status code on successful insertion', async () => {
        ddbMock.on(PutItemCommand).resolves({});
        const event = {
            body: JSON.stringify({ name: 'Player1', score: 90 }), // Updated to a valid score
        };

        const response = await handler(event);

        expect(response.statusCode).toBe(201);
        expect(JSON.parse(response.body).message).toBe('Score added successfully');
        expect(ddbMock.commandCalls(PutItemCommand).length).toBe(1);
    });

    it('should return a 400 status code if the name is missing', async () => {
        const event = {
            body: JSON.stringify({ score: 50 }), // Updated to a valid score for this test
        };

        const response = await handler(event);

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body).message).toBe('Invalid name or score. Score must be between 0 and 90'); // Updated message
        expect(ddbMock.commandCalls(PutItemCommand).length).toBe(0);
    });

    it('should return a 400 status code if the score is missing', async () => {
        const event = {
            body: JSON.stringify({ name: 'Player1' }),
        };

        const response = await handler(event);

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body).message).toBe('Invalid name or score. Score must be between 0 and 90'); // Updated message
        expect(ddbMock.commandCalls(PutItemCommand).length).toBe(0);
    });

    it('should return a 400 status code if the score is not a number', async () => {
        const event = {
            body: JSON.stringify({ name: 'Player1', score: 'not-a-number' }),
        };

        const response = await handler(event);

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body).message).toBe('Invalid name or score. Score must be between 0 and 90'); // Updated message
        expect(ddbMock.commandCalls(PutItemCommand).length).toBe(0);
    });

    it('should return a 400 status code if the score exceeds the maximum plausible score', async () => {
        const event = {
            body: JSON.stringify({ name: 'Player1', score: 91 }), // Score just above MAX_PLAUSIBLE_SCORE
        };

        const response = await handler(event);

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body).message).toBe('Invalid name or score. Score must be between 0 and 90');
        expect(ddbMock.commandCalls(PutItemCommand).length).toBe(0);
    });

    it('should return a 500 status code when a DynamoDB error occurs', async () => {
        ddbMock.on(PutItemCommand).rejects(new Error('DynamoDB error'));
        const event = {
            body: JSON.stringify({ name: 'Player1', score: 50 }), // Updated to a valid score
        };

        const response = await handler(event);

        expect(response.statusCode).toBe(500);
        expect(JSON.parse(response.body).message).toBe('Error adding score');
    });
});

