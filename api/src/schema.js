import {
  GraphQLInterfaceType,
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLSchema,
  GraphQLInputObjectType, GraphQLEnumType,
} from "graphql";

import {
  Mutation,
  Query,
  Workspace,
} from "./resolvers";
import { parseId } from "./util";

const typeMap = {
  workspace: "Workspace",
  run: "Run",
  var: "WorkspaceVariable",
};

const nodeType = new GraphQLInterfaceType({
  name: "Node",
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: "ID of the node.",
    },
  }),
  resolveType: obj => {
    const { type } = parseId(obj.id);
    return typeMap[type];
  },
});

const workspaceVariableType = new GraphQLObjectType({
  name: "WorkspaceVariable",
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: "ID of the workspace variable.",
    },
    key: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The key of the variable.",
    },
    value: {
      type: GraphQLString,
      description: "The value of the variable.",
    },
    sensitive: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: "Indicates if the variable is a sensitive value."
    },
    workspaceId: {
      type: new GraphQLNonNull(GraphQLID),
    },
  }),
  interfaces: () => [nodeType],
});

const workspaceType = new GraphQLObjectType({
  name: "Workspace",
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: "ID of the workspace.",
    },
    name: {
      type: new GraphQLNonNull(GraphQLID),
      description: "Name of the workspace.",
    },
    createdAt: {
      type: new GraphQLNonNull(GraphQLID),
      description: "Time of workspace creation.",
    },
    workspaceVariables: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(workspaceVariableType))),
      description: "The variables corresponding to this workspace.",
      resolve: Workspace.workspaceVariables,
    },
  }),
  interfaces: () => [nodeType],
});

const pageInfoType = new GraphQLObjectType({
  name: "PageInfo",
  fields: () => ({
    startCursor: {
      type: GraphQLString,
    },
    endCursor: {
      type: GraphQLString,
    },
    hasNextPage: {
      type: new GraphQLNonNull(GraphQLBoolean),
    },
    hasPreviousPage: {
      type: new GraphQLNonNull(GraphQLBoolean),
    },
  }),
});

const workspaceEdgeType = new GraphQLObjectType({
  name: "WorkspaceEdge",
  fields: () => ({
    cursor: {
      type: new GraphQLNonNull(GraphQLString),
    },
    node: {
      type: new GraphQLNonNull(workspaceType),
    },
  }),
});

const workspaceConnectionType = new GraphQLObjectType({
  name: "WorkspaceConnection",
  fields: () => ({
    edges: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(workspaceEdgeType))),
    },
    pageInfo: {
      type: pageInfoType,
    },
  }),
});

const queryType = new GraphQLObjectType({
  name: "Query",
  fields: () => ({
    node: {
      type: nodeType,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLID),
        },
      },
      resolve: Query.node,
    },
    workspaces: {
      type: workspaceConnectionType,
      args: {
        first: {
          type: GraphQLInt,
        },
        last: {
          type: GraphQLInt,
        },
        before: {
          type: GraphQLString,
        },
        after: {
          type: GraphQLString,
        },
      },
      resolve: Query.workspaces
    },
    workspace: {
      type: workspaceType,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLID),
        },
      },
      resolve: Query.workspace,
    },
    workspaceByName: {
      type: workspaceType,
      args: {
        name: {
          type: new GraphQLNonNull(GraphQLString),
        },
      },
      resolve: Query.workspaceByName,
    },
  }),
});

const createWorkspaceInputType = new GraphQLInputObjectType({
  name: "CreateWorkspaceInput",
  fields: () => ({
    name: {
      type: new GraphQLNonNull(GraphQLString),
    },
  }),
});

const createWorkspacePayloadType = new GraphQLObjectType({
  name: "CreateWorkspacePayload",
  fields: () => ({
    workspace: {
      type: workspaceType,
    },
  }),
});


const createWorkspaceVariableInputType = new GraphQLInputObjectType({
  name: "CreateWorkspaceVariableInput",
  fields: () => ({
    workspaceId: {
      type: new GraphQLNonNull(GraphQLID),
    },
    key: {
      type: new GraphQLNonNull(GraphQLString),
    },
    value: {
      type: new GraphQLNonNull(GraphQLString),
    },
    sensitive: {
      type: GraphQLBoolean,
    },
  }),
});

const createWorkspaceVariablePayloadType = new GraphQLObjectType({
  name: "CreateWorkspaceVariablePayload",
  fields: () => ({
    workspaceVariable: {
      type: workspaceVariableType,
    },
  }),
});

const runStatusTimestampsType = new GraphQLObjectType({
  name: "StatusTimestamps",
  fields: () => ({
    pendingAt: {
      type: new GraphQLNonNull(GraphQLString),
    },
    planQueuedAt: {
      type: new GraphQLNonNull(GraphQLString),
    },
    planningAt: {
      type: new GraphQLNonNull(GraphQLString),
    },
    confirmedAt: {
      type: new GraphQLNonNull(GraphQLString),
    },
    applyQueuedAt: {
      type: new GraphQLNonNull(GraphQLString),
    },
    applyingAt: {
      type: new GraphQLNonNull(GraphQLString),
    },
    appliedAt: {
      type: new GraphQLNonNull(GraphQLString),
    },
    discardedAt: {
      type: new GraphQLNonNull(GraphQLString),
    },
    canceledAt: {
      type: new GraphQLNonNull(GraphQLString),
    },
    erroredAt: {
      type: new GraphQLNonNull(GraphQLString),
    },
  }),
});

const runType = new GraphQLObjectType({
  name: "Run",
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
    createdAt: {
      type: new GraphQLNonNull(GraphQLString),
    },
    status: {
      type: new GraphQLNonNull(runStatusType),
    },
    statusTimestamps: {
      type: new GraphQLNonNull(runStatusTimestampsType),
    },
    planOutput: {
      type: new GraphQLNonNull(GraphQLString),
    },
    applyOutput: {
      type: new GraphQLNonNull(GraphQLString),
    },
  }),
  interfaces: [nodeType],
});

const createRunInputType = new GraphQLInputObjectType({
  name: "CreateRunInput",
  fields: () => ({
    workspaceId: {
      type: new GraphQLNonNull(GraphQLID),
    },
  }),
});

const createRunPayloadType = new GraphQLObjectType({
  name: "CreateRunPayload",
  fields: () => ({
    run: {
      type: runType,
    },
  }),
});

const updateWorkspaceInputType = new GraphQLInputObjectType({
  name: "UpdateWorkspaceInput",
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLString),
    },
    name: {
      type: GraphQLString,
    },
    workingDirectory: {
      type: GraphQLString,
    },
  }),
});

const updateWorkspacePayloadType = new GraphQLObjectType({
  name: "UpdateWorkspacePayload",
  fields: () => ({
    workspace: {
      type: workspaceType,
    },
  }),
});

const mutationType = new GraphQLObjectType({
  name: "Mutation",
  fields: () => ({
    createRun: {
      type: createRunPayloadType,
      args: {
        input: {
          type: createRunInputType,
        },
      },
      resolve: Mutation.createRun,
    },
    createWorkspace: {
      type: createWorkspacePayloadType,
      args: {
        input: {
          type: createWorkspaceInputType,
        },
      },
      resolve: Mutation.createWorkspace,
    },
    createWorkspaceVariable: {
      type: createWorkspaceVariablePayloadType,
      args: {
        input: {
          type: createWorkspaceVariableInputType,
        },
      },
      resolve: Mutation.createWorkspaceVariable,
    },
    updateWorkspace: {
      type: updateWorkspacePayloadType,
      args: {
        input: {
          type: updateWorkspaceInputType,
        },
      },
      resolve: Mutation.updateWorkspace,
    },
  }),
});

const runStatusType = new GraphQLEnumType({
  name: "RunStatus",
  values: {
    PENDING: {
      value: "PENDING",
    },
    PLAN_QUEUED: {
      value: "PLAN_QUEUED",
    },
    PLANNING: {
      value: "PLANNING",
    },
    PLANNED: {
      value: "PLANNING",
    },
    CONFIRMED: {
      value: "PLANNING",
    },
    APPLY_QUEUED: {
      value: "PLANNING",
    },
    APPLYING: {
      value: "PLANNING",
    },
    APPLIED: {
      value: "PLANNING",
    },
    DISCARDED: {
      value: "PLANNING",
    },
    CANCELED: {
      value: "PLANNING",
    },
    ERRORED: {
      value: "PLANNING",
    },
  },
});

const schema = new GraphQLSchema({
  query: queryType,
  mutation: mutationType,
});

export default schema;
