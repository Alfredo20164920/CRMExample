// Resolvers => Funciones de retornar valores que existen en el schema, consultar la BD y traer los datos, 
// los nombres deben sern iguales a los definidos en el schema
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({path: ".env"});

const User = require('../models/user');
const Product = require('../models/product');
const Client = require('../models/client');
const Order = require('../models/order');

const crearToken = (user, secretWord, expiresIn) => {
    const { id, name, lastName, email } = user;
    return jwt.sign ( { id, name, lastName, email }, secretWord, { expiresIn })
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
        },
        getClients: async () => {
            try {
                const clients = await Client.find({});
                return clients;
            } catch (error) {
                console.log(error)
            }
        },
        getClientBySeller: async (_, {}, ctx) => {
            try {
                const clients = await Client.find({seller: ctx.user.id.toString()});
                return clients;
            } catch (error) {
                console.log(error)
            }
        },
        getClientById: async (_, { id }, ctx) => {
            // Is the product exist
            const client = await Client.findById(id);
            if (!client) {
                throw new Error('Client not found');
            }

            // Only the person who create can see it
            if(client.seller.toString() !== ctx.user.id){
                throw new Error('You are not authorized to see this client');
            }

            return client
        },
        getOrders: async () => {
            try {
                const orders = await Order.find({});
                return orders;
            } catch (error) {
                console.log(error)
            }
        },
        getOrdersBySeller: async(_, { }, ctx) => {
            try {
                const orders = await Order.find({seller: ctx.user.id.toString()});
                return orders;
            } catch (error) {
                console.log(error)
            }
        },
        getOrderById: async (_, { id }, ctx) => {
            // Is the product exist
            const order = await Order.findById(id);
            if (!order) {
                throw new Error('Order not found');
            }

            // Only the person who create can see it 
            if(order.seller.toString() !== ctx.user.id){
                throw new Error('You are not authorized to see this order');
            }

            // Return values
            return order;

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
        },
        deleteProduct: async (_, { id }, ctx) => {
            let product = await Product.findById(id);
            if (!product) {
                throw new Error('Product not found');
            }
            
            await Product.findOneAndDelete({_id: id});
            return "Product deleted";
        },
        createClient: async (_, { input }, ctx) => {
            // Verify if exist
            const { email } = input;
            const isClientExist = await Client.findOne({ email });
            if (isClientExist) {
                throw new Error('Client already exist');
            }

            // Assign seller
            const client = new Client(input);
            client.seller = ctx.user.id;
            
            // Save
            try {
                const result = await client.save();
                return result;
            } catch (error) {
                console.log(error)
            }
        },
        updateClient: async (_, { id, input }, ctx) => {
            let client = await Client.findById(id);
            if (!client) {
                throw new Error('Client not found');
            }

            // Verify seller
            if (client.seller.toString() !== ctx.user.id) {
                throw new Error('You are not authorized to update this client');
            }

            // Update client
            client = await Client.findOneAndUpdate({ _id: id }, input, {new: true});
            return client;
        },
        deleteClient: async (_, { id }, ctx) => {
            let client = await Client.findById(id);
            if (!client) {
                throw new Error('Client not found');
            }

            // Verify seller
            if (client.seller.toString() !== ctx.user.id) {
                throw new Error('You are not authorized to update this client');
            }

            // Delete Client
            await Client.findOneAndDelete({_id: id});
            return "Client deleted";

        },
        createOrder: async (_, { input }, ctx) => {
            const { client } = input;
            // Verify if client exist
            let isClientExist = await Client.findById(client);
            if(!isClientExist) {
                throw new Error('Client not found');
            }

            // Verify if the order is from de seller
            if (isClientExist.seller.toString() !== ctx.user.id) {
                throw new Error('You are not authorized to update this client');
            }

            // Check the stock
            for await (const article of input.order) {

                const { id } = article;
    
                const product = await Product.findById(id);

                if(article.quantity > product.stock) {
                    throw new Error(`Article: ${product.name} don´t have stock`);
                } else {
                    // Reduce quantity
                    product.stock -= article.quantity;
                    await product.save();
                }

            }

            // Create new order
            const newOrder = new Order(input);

            // Assign seller
            newOrder.seller = ctx.user.id;

            // Save
            const result = await newOrder.save();
            return result;
        },
        updateOrder: async (_, { id, input }, ctx) => {

            const {client} = input

            // Verify if the order exist
            const isExistOrder = await Order.findById(id);
            if(!isExistOrder) {
                throw new Error('Order not found');
            }

            // Verify if client exist
            let isClientExist = await Client.findById(client);
            if(!isClientExist) {
                throw new Error('Client not found');
            }
            
            // Verify if the order is from de seller
            if (isClientExist.seller.toString() !== ctx.user.id) {
                throw new Error('You are not authorized to update this client');
            }
            // Check the stock

            if(input.order) {

                for await (const article of input.order) {
    
                    const { id } = article;
        
                    const product = await Product.findById(id);
    
                    if(article.quantity > product.stock) {
                        throw new Error(`Article: ${product.name} don´t have stock`);
                    } else {
                        // Reduce quantity
                        product.stock -= article.quantity;
                        await product.save();
                    }
    
                }
            } 


            // Save order
            const result = await Order.findByIdAndUpdate({_id: id}, input, {new: true});
            return result;
        },
        deleteOrder: async (_, { id }, ctx) => {
            // Verify if order exist
            const order = await Order.findById(id);
            if(!order) {
                throw new Error('Order not found');
            }


            // Verify if the seller try to delete
            if (order.seller.toString() !== ctx.user.id) {
                throw new Error('You are not authorized to delete this order');
            }

            // Delete
            await Order.findOneAndDelete({_id: id});
            return "Order deleted";
        }
    }
}

module.exports = resolvers;