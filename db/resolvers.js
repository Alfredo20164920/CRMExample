// Resolvers => Funciones de retornar valores que existen en el schema, consultar la BD y traer los datos, 
// los nombres deben sern iguales a los definidos en el schema
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({path: ".env"});

const User = require('../models/user');

const crearToken = (user, secretWord, expiresIn) => {
    const { id, name, lastName, email } = user;
    return jwt.sign( { id, name, lastName, email }, secretWord, { expiresIn })
}

const resolvers = {
    Query: {
        getUser: async (_, { token }, ctx) => {
            const userId = await jwt.verify(token, process.env.SECRET_WORD);

            return userId;
        }
    },
    Mutation: {
        newUser: async (_, { input }, ctx) => {
            
            const { email, password } = input;
            
            // Is user register
            const isUserExist = await User.findOne({email});
            if (isUserExist) {
                throw new Error('User already exist');
            }

            // Hash password
            const salt = await bcryptjs.genSalt(10);
            input.password = await bcryptjs.hash(password, salt);


            // Save in DB
            try {
                const user = new User(input);
                user.save();

                return user;
            } catch (error) {
                
            }

        },
        authenticateUser: async (_, { input }, ctx) => {
            const {email, password} = input;

            // Is the user exist?
            const isUserExist = await User.findOne({email});
            if (!isUserExist) {
                throw new Error('User not found');
            }

            // Review password
            const correctPassword = await bcryptjs.compare(password, isUserExist.password);
            if (!correctPassword) {
                throw new Error('Password incorrect');
            }
            // Create token
            return {
                token: crearToken(isUserExist, process.env.SECRET_WORD, '24h'),
            }

        }
    }
}

module.exports = resolvers;