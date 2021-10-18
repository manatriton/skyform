const Runs = require("./models/run");
const Workspaces = require("./models/workspace");
const WorkspaceVariables = require("./models/workspace-variable");

function createStore(db) {
  return {
    db,
    workspaces: new Workspaces({ db }),
    runs: new Runs({ db }),
    workspaceVariables: new WorkspaceVariables({ db }),
  };
}

module.exports = { createStore };
