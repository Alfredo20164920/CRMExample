// Resolvers => Funciones de retornar valores que existen en el schema, consultar la BD y traer los datos, 
// los nombres deben sern iguales a los definidos en el schema
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({path: ".env"});

const User = require('../models/user');
const Product = require('../models/product');

const crearToken = (user, secretWord, expiresIn) => {
    const { id, name, lastName, email } = user;
    return jwt.sign( { id, name, lastName, email }, secretWord, { expiresIn })
}

const resolvers = {
    Query: {
        getUser: async (_, { token }, ctx) => {
            const userId = await jwt.verify(token, process.env.SECRET_WORD);

            return userId;
        },
        getProducts: async () => {
            try {
                const products = await Product.find({});
                return products;
            } catch (error) {
                console.log(error)
            }
        },
        getProductById: async (_, { id }, ctx) => {
            // Is the product exist
            const product = await Product.findById(id);
            if (!product) {
                throw new Error('Product not found');
            }

            return product;
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

        },
        createProduct: async (_, { input }, ctx) => {
            try {
                const product = new Product(input);

                // Save in DB
                const result = await product.save();

                return result;
            } catch (error) {
                console.log(error);
            }
        },
        updateProduct: async (_, { id, input }, ctx) => {
            let product = await Product.findById(id);
            if (!product) {
                throw new Error('Product not found');
            }

            // save on db
            product = await Product.findOneAndUpdate({_id: id }, input, {new: true}); 
            return product;   
        }
    }
}

module.exports = resolvers;