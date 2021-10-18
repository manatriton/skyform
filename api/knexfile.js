const { v4: uuid } = require("uuid");
const database = process.env.NODE_ENV === "test" ? uuid() : process.env.SKYFORM_DATABASE;

module.exports = {
  // Default configuration.
  client: 'postgresql',
  connection: {
    database: global.database || database,
    user: process.env.SKYFORM_USER,
    password: process.env.SKYFORM_PASSWORD,
    host: process.env.SKYFORM_HOST || "localhost",
    port: process.env.SKYFORM_PORT || "5432",
  },
  pool: {
    min: 2,
    max: 10
  },
};
