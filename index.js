const {ApolloServer} = require('apollo-server');
const jwt = require('jsonwebtoken');
require('dotenv').config({path: ".env"});

const typeDefs = require("./db/schema");
const resolvers = require("./db/resolvers");
const dbConnect = require('./config/db');

// Conectar a la db
dbConnect();

// Server
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
        const token = req.headers['authorization'] || '';
        if(token) {
            try {
                const user = jwt.verify(token, process.env.SECRET_WORD);
                return {
                    user
                }
            } catch (error) {
                console.log("An error occurred")
                console.log(error)
            }
        }
    }
});

//Run the server
server.listen()
    .then( ({url}) => {
        console.log(`Server running at: ${url}`);
    })