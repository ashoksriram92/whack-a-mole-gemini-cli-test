const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall } = require("@aws-sdk/util-dynamodb");
const { v4: uuidv4 } = require('uuid');

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const tableName = process.env.TABLE_NAME || 'WhackAMoleLeaderboard';

exports.handler = async (event) => {
    try {
        const { name, score } = JSON.parse(event.body);

        if (!name || typeof score !== 'number') {
            return {
                statusCode: 400,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify({ message: "Invalid name or score" }),
            };
        }

        const params = {
            TableName: tableName,
            Item: marshall({
                id: uuidv4(),
                name: name,
                score: score,
                createdAt: new Date().toISOString(),
            }),
        };

        await client.send(new PutItemCommand(params));

        return {
            statusCode: 201,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({ message: "Score added successfully" }),
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({ message: "Error adding score" }),
        };
    }
};
