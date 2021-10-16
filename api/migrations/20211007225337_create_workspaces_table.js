
exports.up = function(knex) {
  return knex.schema.createTable("workspaces", table => {
    table.increments();
    table.string("name").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.string("working_directory");

    table.unique("name");
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists("workspaces");
};
