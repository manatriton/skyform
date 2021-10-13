import debug from "debug";
import { knex } from "knex";
import knexfile from "../knexfile";
import { convertToCamelCase } from "./util";

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

// config.postProcessRespone = postProcessResponse;

export default knex(config);