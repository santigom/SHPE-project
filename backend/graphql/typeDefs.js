const typeDefs = `
    type User {
        id: ID!
        username: String!
        email: String!
    }
    type Entry {
        id: ID!
        userId: ID!
        title: String!
        mediaType: String!
        status: String!
        rating: Float
        progress: Int!
        notes: String
    }    
    type Query {
        hello: String!
        me: User
        myEntries: [Entry!]!
        entry(id: ID!): Entry
        entriesByStatus(status: String!): [Entry!]!
    }

    type Mutation {
        register(username: String!, email: String!, password: String!): String
        login(username: String!, password: String!): String

        addEntry(title: String!, mediaType: String!): Entry!
        updateEntry(id: ID!, title: String, status: String, rating: Float, progress: Int, notes: String): Entry!
        deleteEntry(id: ID!): Boolean!
        incrementProgress(id: ID!): Entry!
    }
`;

// add YOUR OWN object types here, e.g. type Book { id: ID title: String }
// a [Book] return type means a list, and Book! means it can't be null

module.exports = typeDefs;