import path from "path";

import { Worker } from "bullmq";
import execa from "execa";
import pino from "pino";

import db from "./db";

const log = pino({ level: "info" });

function initializeWorkerOptions(options) {
  return {
    ...options,
    queueName: options.queueName || "skyform:jobs",
  };
}

async function handleJob(job) {
  log.info(`job ${job.id} started`);

  const { command, workspaceId, runId } = job.data;

  await job.updateProgress({
    command,
    workspaceId,
    runId,
    status: "in_progress",
    timestamp: new Date(),
  });


  try {
    // Initialize terraform.
    log.info("running terraform init");
    const cwd = path.resolve(new URL(import.meta.url).pathname, "../../fixtures/terraform-example");
    console.log(cwd);
    await execa("terraform", ["init"], {
      cwd,
    });

    // Get workspace variables and serialize to CLI arguments.
    const workspaceVariables = await db("workspace_variables")
      .select(["key", "value", "sensitive"])
      .where({ workspace_id: workspaceId });

    const args = [];
    if (command === "apply") {
      args.push("-auto-approve");
    }

    for (const variable of workspaceVariables) {
      args.push("-var");
      args.push(`${variable.key}=${variable.value}`);
    }

    // Run terraform plan
    log.info(`running command: ${["terraform", command, "-input=false", ...args]}`);
    const { all, exitCode, stdout, stderr } = await execa("terraform", [command, "-input=false", ...args], {
      all: true,
      cwd,
    });
    return {
      all,
      command,
      exitCode,
      status: "completed",
      runId,
      stderr,
      stdout,
      timestamp: new Date(),
      workspaceId,
    };
  } catch (err) {
    return {
      all: err.all,
      command,
      exitCode: err.errno,
      runId,
      status: "failed",
      stderr: err.stderr,
      stdout: err.stdout,
      timestamp: new Date(),
      workspaceId,
    };
  }
}

function startWorker(options = {}) {
  options = initializeWorkerOptions(options);

  const worker = new Worker(options.queueName, handleJob);
  worker.on("completed", job => {
    log.info(`job ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    console.log(err);
    log.info(`job ${job.id} failed`);
  });

  log.info(`worker listening for jobs on queue '${options.queueName}'`);
}

export default startWorker;