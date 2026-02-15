const { DynamoDBClient, ScanCommand } = require("@aws-sdk/client-dynamodb");
const { unmarshall } = require("@aws-sdk/util-dynamodb");

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const tableName = process.env.TABLE_NAME || 'WhackAMoleLeaderboard';

exports.handler = async (event) => {
    try {
        const params = {
            TableName: tableName,
        };
        const { Items } = await client.send(new ScanCommand(params));
        
        const scores = Items.map(item => unmarshall(item));
        scores.sort((a, b) => b.score - a.score);
        const top5 = scores.slice(0, 5);

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "https://ashoksriram92.github.io/whack-a-mole-gemini-cli-test/",
            },
            body: JSON.stringify(top5),
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "https://ashoksriram92.github.io/whack-a-mole-gemini-cli-test/",
            },
            body: JSON.stringify({ message: "Error retrieving scores" }),
        };
    }
};
