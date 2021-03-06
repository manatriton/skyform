const path = require("path");
const { Readable } = require("stream");
const unzipper = require("unzipper");
const {
  decodeCursorString,
  encodeCursor,
  formatId,
  parseId,
} = require("./util");

const DEFAULT_PAGE_SIZE = 25;

const Query = {
  // Retrieves a node by its global ID.
  node: async (_, { id }, { db, store }) => {
    const { type } = parseId(id);
    switch (type) {
      case "workspace":
        return store.workspaces.getWorkspaceById(id);
      case "var":
        return store.workspaceVariables.getById(id);
      case "run":
        return store.runs.getRunById(id);
      default:
        return null;
    }
  },
  // Return a list of workspaces, sorted by workspace name.
  workspaces: async (_, { first, last, before, after }, { db }) => {
    let query = db
      .select()
      .from("workspaces");

    // If neither first nor last are specified, we default to paginating with
    // first/after and assign the default page size.
    if (!first && !last) {
      first = DEFAULT_PAGE_SIZE;
    }

    if (first) {
      if (after) {
        const afterCursor = decodeCursorString(after);
        query = query.where("name", ">", afterCursor.name);
      }
      query = query.orderBy("id").limit(first + 1);

    } else {
      if (before) {
        const beforeCursor = decodeCursorString(before);
        query = query.where("name", "<", beforeCursor.name);
      }
      query = query.orderBy("id", "desc").limit(last + 1);
    }

    const workspaces = await query;
    const edges = workspaces.map(workspace => ({
      cursor: encodeCursor({ name: workspace.name }),
      node: {
        id: formatId("workspace", workspace.id),
        name: workspace.name,
        createdAt: workspace.created_at.toISOString(),
      },
    }));

    // Drop the extra element.

    let pageInfo;
    if (first) {
      if (edges.length > first) {
        edges.pop();
      }
      pageInfo = edges.length ?
        {
          startCursor: edges[0].cursor,
          endCursor: edges[edges.length - 1].cursor,
          hasNextPage: workspaces.length > first,
          hasPreviousPage: false,
        } :
        {
          startCursor: null,
          endCursor: null,
          hasNextPage: false,
          hasPreviousPage: false,
        };
    } else {
      if (edges.length > last) {
        edges.pop();
      }
      edges.reverse();
      pageInfo = edges.length ?
        {
          startCursor: edges[0].cursor,
          endCursor: edges[edges.length - 1].cursor,
          hasNextPage: false,
          hasPreviousPage: workspaces.length > last,
        } :
        {
          startCursor: null,
          endCursor: null,
          hasNextPage: false,
          hasPreviousPage: false,
        };
    }

    return {
      edges,
      pageInfo,
    };
  },
  workspace: (obj, { id }, { store }) => {
    return store.workspaces.getWorkspaceById(id);
  },
  workspaceByName: (obj, { name }, { store }) => {
    return store.workspaces.getWorkspaceByName(name);
  },
};

const Workspace = {
  workspaceVariables: (obj, _, { store }) => {
    return store.workspaceVariables.getByWorkspaceId(obj.id);
  },
  runs: (obj, _, { store }) => {
    return store.runs.getRunsByWorkspaceId(obj.id);
  },
};

const Run = {
  applyOutput: (obj, _, { store }) => {
    return store.runs.getRunApplyOutput(obj.id);
  },
  planOutput: (obj, _, { store }) => {
    return store.runs.getRunPlanOutput(obj.id);
  },
};

const Mutation = {
  createWorkspace: async (_, { input: { name, zipFile } }, { store }) => {
    let workspace = await store.workspaces.createWorkspace({ name });

    // Extract output to workspace specific folder.
    const baseDirectoryName = `workspace_${Date.now()}`;
    const baseDirectory = path.resolve(__filename, "../../fixtures", baseDirectoryName);

    const readable = Readable.from(Buffer.from(zipFile.base64, "base64"));
    readable.pipe(unzipper.Extract({ path: baseDirectory }));

    await new Promise(resolve => {
      readable.on("end", () => {
        resolve();
      });
    });

    workspace = await store.workspaces.updateWorkspace({ id: workspace.id, baseDirectory });
    return { workspace };
  },
  createWorkspaceVariable: async (_, { input: { workspaceId, key, value, sensitive = false }}, { store }) => {
    const workspaceVariable = await store.workspaceVariables.create({
      key,
      value,
      sensitive,
      workspaceId
    });

    return { workspaceVariable };
  },
  createRun: async (_, { input: { workspaceId } }, { store }) => {
    const run = await store.runs.createRun({ workspaceId });
    return { run };
  },
  confirmRun: async (_, { input: { runId } }, { store }) => {
    const run = await store.runs.confirmRun(runId);
    return { run };
  },
  deleteWorkspaceVariable: async (_, { input: { id } }, { store }) => {
    const deletedWorkspaceVariableId = await store.workspaceVariables.deleteById(id);
    return { deletedWorkspaceVariableId };
  },
  updateWorkspace: async (_, { input: { id, name, workingDirectory } }, { store }) => {
    const workspace = await store.workspaces.updateWorkspace({ id, name, workingDirectory });
    return { workspace };
  },
  updateWorkspaceVariable: async (_, { input: { id, key, value, sensitive } }, { store }) => {
    const workspaceVariable = await store.workspaceVariables.update({ id, key, value, sensitive });
    return { workspaceVariable };
  },
};

module.exports = {
  Query,
  Workspace,
  Run,
  Mutation,
};
