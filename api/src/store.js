import Runs from "./models/run";
import Workspaces from "./models/workspace";
import WorkspaceVariables from "./models/workspace-variable";

export function createStore(db) {
  return {
    db,
    workspaces: new Workspaces({ db }),
    runs: new Runs({ db }),
    workspaceVariables: new WorkspaceVariables({ db }),
  };
}
