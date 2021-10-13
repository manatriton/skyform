
exports.up = function(knex) {
  return knex.schema.createTable("workspace_variables", table => {
    table.increments();
    table.string("key").notNullable();
    table.string("value").notNullable();
    table.boolean("sensitive").notNullable();
    table.integer("workspace_id").unsigned().notNullable();

    table.foreign("workspace_id").references("id").inTable("workspaces").onDelete("cascade");

    table.unique("key");
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists("workspace_variables");
};
