const { Context } = require('@azure/functions');
const { Connection, Request } = require('tedious');

const config = {
    server: 'chefbuddiesserver.database.windows.net',
    authentication: {
        type: 'default',
        options: {
            userName: 'chefbuddiesserver',
            password: '123chefCHEF',
        },
    },
    options: {
        encrypt: true,
        database: 'ChefBuddiesDatabase',
        rowCollectionOnDone: true,
        useColumnNames: false,
    },
};

module.exports = async function (context, req) {
    const { email, password } = req.body;

    const connection = new Connection(config);

    connection.on('connect', (err) => {
        if (err) {
            context.res = {
                status: 500,
                body: { message: "Error connecting to the database" },
            };
            context.done();
            return;
        }

        const request = new Request(`SELECT * FROM Users WHERE email  = '${email}' AND password = '${password}'`, (err, rowCount, rows) => {
            if (err) {
                context.res = {
                    status: 500,
                    body: { message: "Error querying the database" },
                };
            } else {
                if (rowCount > 0) {
                    context.res = {
                        status: 200,
                        body: { message: "Login successful" },
                    };
                } else {
                    context.res = {
                        status: 401,
                        body: { message: "Invalid credentials" },
                    };
                }
            }

            context.done();
        });

        connection.execSql(request);
    });

    connection.connect();
};