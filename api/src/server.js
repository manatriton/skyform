const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const passport = require("passport");
const BearerStrategy = require("passport-http-bearer");

const { db, config } = require("./db");
const schema = require("./schema");
const { createStore } = require("./store");
const generateToken = require("./token");

const context = { db, store: createStore(db) };

function initializeOptions(options) {
  return {
    ...options,
    address: options.address || "localhost:4000",
  };
}

module.exports = async function(options = {}) {

  options = initializeOptions(options);

  const rootToken = options.token || await generateToken();
  const rootUser = { name: "dev-root" };

  // Use bearer strategy to authenticate token.
  passport.use(new BearerStrategy((token, done) => {
    if (token === rootToken) {
      return done(null, rootUser);
    } else {
      return done("invalid token", null)
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
};