const {ApolloServer} = require('apollo-server');
const typeDefs = require("./db/schema");
const resolvers = require("./db/resolvers");
const dbConnect = require('./config/db');

// Conectar a la db
dbConnect();

// Server
const server = new ApolloServer({
    typeDefs,
    resolvers,
});

//Run the server
server.listen()
    .then( ({url}) => {
        console.log(`Server running at: ${url}`);
    })