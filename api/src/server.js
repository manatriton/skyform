import express from "express";
import { graphqlHTTP } from "express-graphql";
import passport from "passport";
import BearerStrategy from "passport-http-bearer";

import db from "./db";
import schema from "./schema";
import { createStore } from "./store";

const context = { db, store: createStore(db) };

function initializeOptions(options) {
  return {
    ...options,
    address: options.address || "localhost:4000",
  };
}

function generateToken() {
  
}

export default function(options = {}) {

  options = initializeOptions(options);

  const rootToken = options.token || "token";
  const rootUser = { name: "root" };

  // Use bearer strategy to authenticate token.
  passport.use(new BearerStrategy((token, done) => {
    if (token === rootToken) {
      return done(null, rootUser);
    }
  }));

  const app = express();

  // app.use(passport.initialize());
  // app.use(passport.authenticate("bearer", { session: false }));

  app.use("/graphql", graphqlHTTP({
    schema,
    context,
    graphiql: true,
  }));

  app.listen(4000, () => {
    console.log(`Server ready at ${options.address}`);
    console.log("Root token:", rootToken);
  });
}