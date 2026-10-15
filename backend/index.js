require('dotenv').config();   // MUST RUN FIRST run so process.env is filled before anything reads it
const express = require('express');
const cors = require('cors');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@as-integrations/express5');
const connectDB = require('./db');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
const { getUserFromToken } = require('./auth/auth');

async function startServer() {
    await connectDB();

    const app = express();
    const server = new ApolloServer({ typeDefs, resolvers });
    await server.start();

    app.use(
        '/graphql',
        cors(),
        express.json(),
        expressMiddleware(server, {
            // runs on every request making it so that it reads the token and puts the user's ID on context!
            context: async ({ req }) => {
                const token = (req.headers.authorization || '').replace('Bearer ', '');
                const user = getUserFromToken(token);
                return { userId: user?.userId };
            },
        })
    );

    const port = process.env.PORT || 4000;
    app.listen(port, () => console.log(`server ready at http://localhost:${port}/graphql`));
}

startServer().catch((err) =>{
    console.error('Server failed to start:', err.message);
    process.exit(1);
});