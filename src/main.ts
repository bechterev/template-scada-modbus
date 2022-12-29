import express from "express";
import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';
import { typeDefs } from "./graph.types";
import { resolvers } from "./resolveDevice";


const server = new ApolloServer({ typeDefs, resolvers, 
plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })] });

const app = express();

server.start().then(res => {
  server.applyMiddleware({ app });

  app.listen({ port: 4000 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
);
}).catch(error=> {
  console.log(error)
})
