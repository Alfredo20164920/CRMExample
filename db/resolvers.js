// Resolvers => Funciones de retornar valores que existen en el schema, consultar la BD y traer los datos, 
// los nombres deben sern iguales a los definidos en el schema
const resolvers = {
    Query: {
        getCourse: () => "Something"
    }
}

module.exports = resolvers;