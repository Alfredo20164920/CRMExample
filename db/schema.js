const { gql } = require('apollo-server');

// Query => El get 
// Mutation => El post, DELETE & UPDATE
// Schema => Describe los datos, su estructura debe ser similar a la de la BD

const typeDefs = gql`
    type Query {
        getCourse: String
    }

    type User {
        id: ID
        name: String
        lastName: String
        email: String
        created: String
    }

    input UserInput {
        name: String!
        lastName: String!
        email: String!
        password: String!
    }

    type Mutation {
        newUser(input: UserInput): User 
    }
`;

module.exports = typeDefs;