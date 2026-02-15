const { DynamoDBClient, ScanCommand } = require("@aws-sdk/client-dynamodb");
const { mockClient } = require("aws-sdk-client-mock");
const { handler } = require("./get-scores");

const ddbMock = mockClient(DynamoDBClient);

describe('Get Scores Handler', () => {
    beforeEach(() => {
        ddbMock.reset();
    });

    it('should return a 200 status code and a list of scores on success', async () => {
        const scores = [
            { id: '1', name: 'Player1', score: 100 },
            { id: '2', name: 'Player2', score: 90 },
            { id: '3', name: 'Player3', score: 80 },
            { id: '4', name: 'Player4', score: 70 },
            { id: '5', name: 'Player5', score: 60 },
            { id: '6', name: 'Player6', score: 50 },
        ];
        ddbMock.on(ScanCommand).resolves({ Items: scores.map(item => require('@aws-sdk/util-dynamodb').marshall(item)) });

        const response = await handler({});
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.length).toBe(5);
        expect(body[0].score).toBe(100);
        expect(body[4].score).toBe(60);
    });

    it('should return a 200 status code and an empty array when the database is empty', async () => {
        ddbMock.on(ScanCommand).resolves({ Items: [] });

        const response = await handler({});
        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toEqual([]);
    });

    it('should return a 500 status code when a DynamoDB error occurs', async () => {
        ddbMock.on(ScanCommand).rejects(new Error('DynamoDB error'));

        const response = await handler({});
        expect(response.statusCode).toBe(500);
        expect(JSON.parse(response.body).message).toBe('Error retrieving scores');
    });
});

