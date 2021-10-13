import { convertToCamelCase, formatId, parseId } from "../util";

const RUN_TYPE = "run";

class Runs {
  constructor(options = {}) {
    this.db = options.db;
  }

  async getRunById(id) {
    const { type, baseId } = parseId(id);
    if (type !== WORKSPACE_TYPE) {
      return null;
    }

    const run = await this.db("runs")
      .select()
      .where({ id: baseId })
      .first();

    return {
      ...convertToCamelCase(run),
      id: formatId(RUN_TYPE, run.id),
    };
  }

  async createRun({ workspaceId }) {
    const result = await this.db("runs")
      .insert({
        // status: "PENDING",
        workspaceId
      })
      .returning(["id", "status", "created_at"]);

    const run = result[0];
    return {
      ...convertToCamelCase(run),
      id: formatId(RUN_TYPE, run.id),
      statusTimestamps: {},
    };
  };
}

export default Runs;