import { ApolloServer, gql } from 'apollo-server';

import { initDbConnection } from 'src/db-connection';

// The GraphQL schema
const typeDefs = gql`
  type Query {
    "A simple type for getting started!"
    hello: String
  }
`;

// A map of functions which return data for the schema.
const resolvers = {
  Query: {
    hello: () => 'world'
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

(() => {
  initDbConnection().then(() => {
    server.listen().then(({ url }) => {
      console.log(`🚀 Server ready at ${url}`);
    });
  });
})();
