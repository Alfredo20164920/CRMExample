const { gql } = require('apollo-server');

// Query => El get 
// Mutation => El post, DELETE & UPDATE
// Schema => Describe los datos, su estructura debe ser similar a la de la BD

const typeDefs = gql`
    type User {
        id: ID
        name: String
        lastName: String
        email: String
        created: String
    }

    type Token {
        token: String
    }

    input UserInput {
        name: String!
        lastName: String!
        email: String!
        password: String!
    }

    input AuthenticateInput {
        email: String!
        password: String!
    }

    type Query {
        getUser(token: String!): User
    }

    type Mutation {
        newUser(input: UserInput): User 
        authenticateUser(input: AuthenticateInput): Token
    }
`;

module.exports = typeDefs;