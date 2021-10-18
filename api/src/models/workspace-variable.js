const { convertToCamelCase, formatId, parseId } = require("../util");
const WORKSPACE_VARIABLE_TYPE = "var";

class WorkspaceVariables {
  constructor(options = {}) {
    this.db = options.db;
  }

  static defaultColumns = [
    "id",
    "key",
    "value",
    "sensitive",
    "workspace_id",
  ];

  static postProcess(workspaceVariable) {
    if (workspaceVariable == null) {
      return null;
    }

    return {
      ...convertToCamelCase(workspaceVariable),
      id: formatId(WORKSPACE_VARIABLE_TYPE, workspaceVariable.id),
      value: workspaceVariable.sensitive ? null : workspaceVariable.value,
      workspaceId: formatId("workspace", workspaceVariable.workspace_id),
    };
  }

  async getById(id) {
    const { type, baseId } = parseId(id);
    if (type !== WORKSPACE_VARIABLE_TYPE) {
      return null;
    }

    const workspaceVariable = await this.db("workspace_variables")
      .select()
      .where({ id: baseId })
      .first();

    return WorkspaceVariables.postProcess(workspaceVariable);
  }

  async create({ key, value, sensitive, workspaceId }) {
    const { type, baseId: workspaceBaseId } = parseId(workspaceId);
    // TODO: Handle invalid workspace id.

    const result = await this.db("workspace_variables")
      .insert({ key, value, sensitive, workspace_id: workspaceBaseId })
      .returning(["id", "key", "value", "sensitive", "workspace_id"]);

    return WorkspaceVariables.postProcess(result[0]);
  }

  async update({ id, key, value, sensitive }) {
    const { type, baseId } = parseId(id);
    if (type !== WORKSPACE_VARIABLE_TYPE) {
      return null;
    }

    const result = await this.db("workspace_variables")
      .update({ key, value, sensitive })
      .where({ id: baseId })
      .returning(WorkspaceVariables.defaultColumns);

    return WorkspaceVariables.postProcess(result[0]);
  }

  async getByWorkspaceId(workspaceId) {
    const { type, baseId: workspaceBaseId } = parseId(workspaceId);
    // TODO: Handle invalid workspace id.

    const result = await this.db("workspace_variables")
      .select()
      .where({ workspace_id: workspaceBaseId });

    return result.map(WorkspaceVariables.postProcess);
  }

  async deleteById(id) {
    const { type, baseId } = parseId(id);
    if (type !== WORKSPACE_VARIABLE_TYPE) {
      return null;
    }

    const result = await this.db("workspace_variables")
      .delete()
      .where({ id: baseId });

    return result ? id : null;
  }
}

module.exports = WorkspaceVariables;