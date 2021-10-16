import { Queue, QueueEvents } from "bullmq";
import { parseISO } from "date-fns";
import pino from "pino";

import db from "./db";

const log = pino({ level: "info" });

class Scheduler {
  static initializeOptions(options) {
    return {
      ...options,
      interval: options.interval || 30000, // 10s default interval
      queueName: options.queueName || "skyform:jobs",
    };
  }

  constructor(options = {}) {
    this.options = Scheduler.initializeOptions(options);
    this.iterationCount = 1;

    this.queue = new Queue(this.options.queueName);
    this.queueEvents = new QueueEvents(this.options.queueName);

    this.setupListeners();
  }

  setupListeners() {
    this.queueEvents.on("progress", async job => {
      const { command, status, timestamp, runId } = job.data;
      log.info(`Job ${job.jobId} has status ${status}`);


      const updates = {
        [command === "apply" ? "applying_at" : "planning_at"]: parseISO(timestamp),
        status: command === "apply" ? "APPLYING" : "PLANNING",
      };

      await db("runs")
        .update(updates)
        .where({ id: runId });
    });

    this.queueEvents.on("completed", async job => {
      const data = job.returnvalue;

      console.log("completed");

      if (data.exitCode !== 0) {
        log.info(`${data.command} job for run ${data.runId}, workspace ${data.workspaceId} failed at ${data.timestamp}`);

        // Update run with status, timestamp, and output.
        await db("runs")
          .update({
            [data.command === "apply" ? "apply_output" : "plan_output"]: data.all,
            errored_at: parseISO(data.timestamp),
            status: "ERRORED",
          })
          .where({ id: data.runId });

      } else {
        log.info(`${data.command} job for run ${data.runId}, workspace ${data.workspaceId} completed at ${data.timestamp}`);

        // Update run with status, timestamp, and output.
        await db("runs")
          .update({
            [data.command === "apply" ? "applied_at" : "planned_at"]: parseISO(data.timestamp),
            [data.command === "apply" ? "apply_output" : "plan_output"]: data.all,
            status: data.command === "apply" ? "APPLIED" : "PLANNED",
          })
          .where({ id: data.runId });
      }
    });
  }

  async run() {
    await this.runSchedulerLoopIteration();

    while (true) {
      await this.runSchedulerLoopIteration();
      this.iterationCount++;
    }
  }

  async runSchedulerLoopIteration() {
    const start = Date.now();
    log.info(`scheduler loop iteration ${this.iterationCount} started at ${new Date(start).toISOString()}`);
    // do iteration
    // Check number of runs

    const subquery = db("runs")
      .select("*")
      .rank("_rank", "created_at", "workspace_id")
      .whereNotIn("status", ["DISCARDED", "CANCELED", "ERRORED", "APPLIED"])
      .as("ranked");

    const runs = await db.select(
      "ranked.id",
      "ranked.status",
      "ranked.created_at",
      "ranked.workspace_id",
      "workspaces.working_directory"
    )
      .from(subquery)
      .join("workspaces", "ranked.workspace_id", "=", "workspaces.id")
      .where({ _rank: 1 })
      .whereIn("status", ["PENDING", "CONFIRMED"]);

    if (runs.length) {
      await Promise.all(runs.map(run => {
        const data = {
          command: run.status === "PENDING" ? "plan" : "apply",
          workspaceId: run.workspace_id,
          runId: run.id,
          baseDirectory: "",
          workingDirectory: "",
        };

        return this.queue.add(data.runId, data);
      }));

      log.info(`Enqueued ${runs.length} runs`);
    } else {
      log.info("no runs to queue");
    }

    const end = Date.now();
    log.info(`scheduler iteration ${this.iterationCount} ended at ${new Date(end).toISOString()}`);

    const delta = end - start;
    log.info(`scheduler iteration took ${delta / 1000}s`);

    if (delta < this.options.interval) {
      log.info(`sleeping ${(this.options.interval - delta) / 1000}s until next scheduler iteration`);
      return new Promise(resolve => setTimeout(resolve, this.options.interval - delta));
    }
  }
}

export default Scheduler;
