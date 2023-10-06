import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import bodyParser from "body-parser";
import express from "express";
import { prismaClient } from "../clients/db";
import { User } from "./user";
import cors from "cors";
import { GraphqlContext } from "../types";
import JwtService from "../services/jwt";
import { Post } from "./post";
import { muatations } from './post/muatation';





export async function Bootstrap() {
  const app = express();
  app.use(cors());
  app.use(bodyParser.json());
  const graphqlServer = new ApolloServer<GraphqlContext>({
    typeDefs: `

    ${User.types}
    ${Post.types}

    type Query {
      ${User.queries}
      ${Post.queries}
    }
    type Mutation {
      ${Post.muatations}
    }
 
   
    
    `,
    resolvers: {
      Query: {
        ...User.resolvers.queries,
        ...Post.resolvers.queries
      },
      Mutation: {
        ...Post.resolvers.mutations,
      },
      ...Post.resolvers.extraResolver, ...User.resolvers.extraResolver
    },
  });

  await graphqlServer.start();

  app.use("/graphql", expressMiddleware(graphqlServer, {
    context: async({req,res})=>{
      return{
        user: req.headers.authorization ? JwtService.decodeToken(req.headers.authorization.split("Bearer ")[1]) : undefined
      } 
  }
  }));

  return app;
}
