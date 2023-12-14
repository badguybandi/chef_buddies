const { AzureFunction, Context } = require('@azure/functions');
const { CosmosClient } = require('@azure/cosmos');

const endpoint = 'YOUR_COSMOS_DB_ENDPOINT';
const key = 'YOUR_COSMOS_DB_KEY';
const databaseId = 'ChefBuddiesDB';
const containerIdUsers = 'Users';
const containerIdSessions = 'Sessions';

const cosmosClient = new CosmosClient({ endpoint, key });

module.exports = async function (context, req) {
    const { email, password } = req.body;

    try {
        const user = await getUserByEmail(email);

        if (user && user.password === password) {
            const sessionId = generateSessionId();
            await createSession(sessionId, user.user_id);

            context.res = {
                status: 200,
                body: { message: "Login successful", sessionId },
            };
        } else {
            context.res = {
                status: 401,
                body: { message: "Invalid credentials" },
            };
        }
    } catch (error) {
        console.error('Error:', error);
        context.res = {
            status: 500,
            body: { message: "Internal server error" },
        };
    }
};

async function getUserByEmail(email) {
    const { resources: users } = await cosmosClient
        .database(databaseId)
        .container(containerIdUsers)
        .items.query(SELECT * FROM c WHERE c.email = "${email}")
        .fetchAll();

    return users[0];
}

async function createSession(sessionId, userId) {
    await cosmosClient
        .database(databaseId)
        .container(containerIdSessions)
        .items.create({ session_id: sessionId, user_id: userId });
}

function generateSessionId() {
    // Implement your session ID generation logic here
    return Math.random().toString(36).substring(2, 15);
}

