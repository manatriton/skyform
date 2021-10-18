const NodeEnvironment = require("jest-environment-node");
const dotenv = require("dotenv");
dotenv.config();

const knexConfig = require("./knexfile");
const { databaseManagerFactory } = require("knex-db-manager");
const knex = require("knex");

const dbManager = databaseManagerFactory({
  knex: knexConfig,
  dbManager: {
    superUser: "postgres",
    superPassword: "postgres",
  },
});

class JestEnvironment extends NodeEnvironment {
  async setup() {
    await super.setup();
    await dbManager.createDb();

    this._knex = knex(knexConfig);
    await this._knex.migrate.latest();
    this.global.dbManager = dbManager;
    this.global.dbName = knexConfig.connection.database;
    this.global.knex = this._knex;
  }

  async teardown() {
    await this._knex.destroy();
    await dbManager.dropDb();
    await dbManager.close();
    await dbManager.close();
    await super.teardown();
  }
}

module.exports = JestEnvironment;
