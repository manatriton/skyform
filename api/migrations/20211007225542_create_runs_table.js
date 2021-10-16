
exports.up = function(knex) {
  return knex.schema.createTable("runs", table => {

    table.increments();
    table.string("status").defaultTo("PENDING").notNullable();

    // Status timestamps.
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();

    table.timestamp("pending_at").defaultTo(knex.fn.now());
    table.timestamp("plan_queued_at");
    table.timestamp("planning_at");
    table.timestamp("planned_at");
    table.timestamp("confirmed_at");
    table.timestamp("apply_queued_at");
    table.timestamp("applying_at");
    table.timestamp("applied_at");
    table.timestamp("discarded_at");
    table.timestamp("canceled_at");
    table.timestamp("errored_at");

    table.text("plan_output");
    table.text("apply_output");
    table.integer("workspace_id").unsigned().notNullable();

    table.foreign("workspace_id").references("id").inTable("workspaces").onDelete("cascade");
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists("runs");
};
