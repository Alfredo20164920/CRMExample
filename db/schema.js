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

    type Product {
        id: ID
        name: String
        stock: Int
        price: Float
        created: String
    }

    type Client {
        id: ID
        name: String
        lastName: String
        company: String
        email: String
        phone: String
        seller: ID
    }

    input UserInput {
        name: String!
        lastName: String!
        email: String!
        password: String!
    }

    input ProductInput {
        name: String!
        stock: Int!
        price: Float!
    }

    input ClientInput {
        name: String!
        lastName: String!
        company: String!
        email: String!
        phone: String
    }

    input AuthenticateInput {
        email: String!
        password: String!
    }

    type Query {
        # Users
        getUser(token: String!): User

        # Products
        getProducts: [Product]
        getProductById(id: ID!): Product

        # Clients
        getClients: [Client]
        getClientBySeller: [Client]
        getClientById(id: ID!): Client
    }

    type Mutation {
        # Users
        newUser(input: UserInput): User 
        authenticateUser(input: AuthenticateInput): Token

        # Products
        createProduct(input: ProductInput): Product
        updateProduct( id: ID!, input: ProductInput ): Product
        deleteProduct(id: ID!): String

        # Clients
        createClient(input: ClientInput): Client
        updateClient( id: ID!, input: ClientInput ): Client
        deleteClient(id: ID!): String
    }
`;

module.exports = typeDefs;