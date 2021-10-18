const { convertToCamelCase, formatId, parseId } = require("../util");
const WORKSPACE_TYPE = "workspace";

/**
 * Service class for interacting with workspace tables;
 */
class Workspaces {
  constructor(options = {}) {
    this.db = options.db;
  }

  static defaultColumns = [
    "id",
    "name",
    "created_at",
    "no_color",
    "working_directory",
  ];

  /**
   * Post-processing function for raw workspace object returned by Knex.
   *
   * @param rawWorkspace
   */
  static postProcess(rawWorkspace) {
    if (!rawWorkspace) {
      return null;
    }

    return {
      ...convertToCamelCase(rawWorkspace),
      id: formatId(WORKSPACE_TYPE, rawWorkspace.id),
      createdAt: rawWorkspace.created_at.toISOString(),
    };
  }

  /**
   * Retrieves a workspace by its id.
   * @param id
   */
  async getWorkspaceById(id) {
    const { type, baseId } = parseId(id);
    if (type !== WORKSPACE_TYPE) {
      return null;
    }

    const workspace = await this.db("workspaces")
      .select()
      .where({ id: baseId })
      .first();

    return Workspaces.postProcess(workspace);
  }

  async getWorkspaceByName(name) {
    const workspace = await this.db("workspaces")
      .select(Workspaces.defaultColumns)
      .where({ name })
      .first();

    return Workspaces.postProcess(workspace);
  }

  async createWorkspace({ name }) {
    const result = await this.db("workspaces")
      .insert({ name })
      .returning(["id", "name", "created_at"]);

    return Workspaces.postProcess(result[0]);
  };

  async updateWorkspace({ id, name, workingDirectory, baseDirectory }) {
    let { type, baseId } = parseId(id);
    // TODO: Handle invalid workspace type.

    if (!(baseId = parseInt(baseId, 10))) {
      return null;
    }

    const result = await this.db("workspaces")
      .update({
        name,
        working_directory: workingDirectory,
        base_directory: baseDirectory,
      })
      .where({ id: baseId })
      .returning(["id", "name", "created_at"]);

    if (!result.length) {
      return null;
    }

    return Workspaces.postProcess(result[0]);
  }
}

module.exports = Workspaces;