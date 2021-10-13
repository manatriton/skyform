// Scheduler for skyform.
// Steps for scheduling
import { Queue, QueueEvents } from "bullmq";
import debug from "debug";
import db from "./db";

import pino from "pino";

const log = pino({ level: "info" });

/**
 * scheduling steps
 *
 * 1. query for runnable workspaces (to be defined later)
 *    - runnable states are PENDING (to run a PLAN), CONFIRMED (to run an APPLY)
 * 2. place a command in the command queue used by executor
 *    - command types: PLAN, APPLY, etc.
 *    - after command placed in queue, update workspace status to either plan_queued or apply_queued
 * 3. executor receives command from command queue, runs command, saving output
 * 4. executor reports command result to result queue
 * 5. scheduler listens to result queue, writes result and output to database
 */

class Scheduler {
  static initializeOptions(options) {
    return {
      ...options,
      interval: options.interval || 1000,
      queueName: options.queueName || "skyform:jobs",
    };
  }

  constructor(options = {}) {
    this.options = Scheduler.initializeOptions(options);
    this.iterationCount = 1;

    this.queue = new Queue(this.options.queueName);
    this.queueEvents = new QueueEvents(this.options.queueName);

    this.queueEvents.on("progress", job => {
      log.info(`Job ${job.jobId} has status ${job.data.status}`);
    });

    this.queueEvents.on("completed", job => {
      log.info(`job ${job.jobId} completed at ${new Date().toISOString()}`);
    });
  }

  async run() {

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

    await this.queue.add("run", { runId: "run:1" });

    const end = Date.now();

    log.info(`scheduler iteration ${this.iterationCount} ended at ${new Date(end).toISOString()}`);
    const delta = end - start;
    return new Promise(resolve => {
      setTimeout(() => resolve(), 10000);
    });


    // const start = Date.now();
    // log("Starting scheduler loop");
    //
    // setTimeout(() => {
    //   const end = Date.now();
    //   const delta = end - start;
    //   log("Finished scheduler loop after %ds", delta / 1000);
    //   this.schedulerLoop();
    // }, this.options.interval);
  }
}

export default Scheduler;

