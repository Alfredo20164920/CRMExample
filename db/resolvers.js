// Resolvers => Funciones de retornar valores que existen en el schema, consultar la BD y traer los datos, 
// los nombres deben sern iguales a los definidos en el schema
const bcryptjs = require('bcryptjs');
const User = require('../models/user');

const resolvers = {
    Query: {
        getCourse: () => "Something"
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

        }
    }
}

module.exports = resolvers;