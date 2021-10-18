const { convertToCamelCase, formatId, parseId } = require("../util");


const RUN_TYPE = "run";

class Runs {
  constructor(options = {}) {
    this.db = options.db;
  }

  static defaultColumns = [
    "id",
    "status",
    "created_at",
    "pending_at",
    "plan_queued_at",
    "planning_at",
    "planned_at",
    "confirmed_at",
    "apply_queued_at",
    "applying_at",
    "applied_at",
    "discarded_at",
    "canceled_at",
    "errored_at",
    "workspace_id",
  ];

  static postProcess(rawRun) {
    if (!rawRun) {
      return null;
    }

    return {
      id: formatId(RUN_TYPE, rawRun.id),
      status: rawRun.status,
      createdAt: rawRun.created_at.toISOString(),
      statusTimestamps: {
        pendingAt: rawRun.pending_at && rawRun.pending_at.toISOString(),
        planQueuedAt: rawRun.plan_queued_at && rawRun.plan_queued_at.toISOString(),
        planningAt: rawRun.planning_at && rawRun.planning_at.toISOString(),
        plannedAt: rawRun.planned_at && rawRun.planned_at.toISOString(),
        confirmedAt: rawRun.confirmed_at && rawRun.confirmed_at.toISOString(),
        applyQueuedAt: rawRun.apply_queued_at && rawRun.apply_queued_at.toISOString(),
        applyingAt: rawRun.applying_at && rawRun.applying_at.toISOString(),
        appliedAt: rawRun.applied_at && rawRun.applied_at.toISOString(),
        discardedAt: rawRun.discarded_at && rawRun.discarded_at.toISOString(),
        canceledAt: rawRun.canceled_at && rawRun.canceled_at.toISOString(),
        erroredAt: rawRun.errored_at && rawRun.errored_at.toISOString(),
      },
      workspaceId: formatId("workspace", rawRun.workspace_id),
    };
  }

  async getRunById(id) {
    const { type, baseId } = parseId(id);
    if (type !== RUN_TYPE) {
      return null;
    }

    const run = await this.db("runs")
      .select(Runs.defaultColumns)
      .where({ id: baseId })
      .first();

    return Runs.postProcess(run);
  }

  async getRunsByWorkspaceId(workspaceId) {
    let { type, baseId: workspaceBaseId } = parseId(workspaceId);
    if (type !== "workspace") {
      return null;
    }

    if (!(workspaceBaseId = parseInt(workspaceBaseId))) {
      return null;
    }

    const runs = await this.db("runs")
      .select(Runs.defaultColumns)
      .where({ workspace_id: workspaceBaseId });

    return runs.map(Runs.postProcess);
  }

  async createRun({ workspaceId }) {
    let { type, baseId: workspaceBaseId } = parseId(workspaceId);
    if (type !== "workspace") {
      return null;
    }

    if (!(workspaceBaseId = parseInt(workspaceBaseId))) {
      return null;
    }

    const result = await this.db("runs")
      .insert({ workspace_id: workspaceBaseId })
      .returning(Runs.defaultColumns);

    return Runs.postProcess(result[0]);
  };

  async confirmRun(runId) {
    let { type, baseId } = parseId(runId);
    if (type !== "run") {
      return null;
    }

    if (!(baseId = parseInt(baseId))) {
      return null;
    }

    const result = await this.db("runs")
      .update({ status: "CONFIRMED" })
      .where({ id: baseId })
      .returning(Runs.defaultColumns);

    return Runs.postProcess(result[0]);
  }

  async getRunPlanOutput(id) {
    let { type, baseId } = parseId(id);
    if (type !== "run") {
      return null;
    }

    if (!(baseId = parseInt(baseId))) {
      return null;
    }

    const { plan_output: planOutput } = await this.db("runs")
      .select("plan_output")
      .where({ id: baseId })
      .first();

    return planOutput;
  }

  async getRunApplyOutput(id) {
    let { type, baseId } = parseId(id);
    if (type !== "run") {
      return null;
    }

    if (!(baseId = parseInt(baseId))) {
      return null;
    }

    const { apply_output: applyOutput } = await this.db("runs")
      .select("apply_output")
      .where({ id: baseId })
      .first();

    return applyOutput;
  }
}

module.exports = Runs;