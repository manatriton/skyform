const debug = require("debug");
const knex = require("knex");
const knexfile = require("../knexfile");
const { convertToCamelCase } = require("./util");

const log = debug("knex:client");

function postProcessResponse(result, queryContext) {
  if (Array.isArray(result)) {
    return result.map(convertToCamelCase);
  }

  return convertToCamelCase(result);
}

const config = knexfile[process.env.NODE_ENV || "development"];
config.log = {
  warn: log,
  error: log,
  deprecate: log,
  debug: log,
};

module.exports = {
  config,
  db: knex(config),
};