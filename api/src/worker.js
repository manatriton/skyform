import { Worker } from "bullmq";
import pino from "pino";
const log = pino({ level: "info" });


function initializeWorkerOptions(options) {
  return {
    ...options,
    queueName: options.queueName || "skyform:jobs",
  };
}

async function handleJob(job) {
  log.info(`job ${job.id} started`);
  await job.updateProgress({ status: "IN_PROGRESS" });

  return new Promise(resolve => {
    const result = {
      status: "COMPLETED",
      value: Math.floor(Math.random() * 10) + 1,

    };

    setTimeout(resolve, 1000, result);
  });
}

function startWorker(options = {}) {
  options = initializeWorkerOptions(options);

  const worker = new Worker(options.queueName, handleJob);
  worker.on("completed", job => {
    log.info(`job ${job.id} completed`);
  });

  log.info(`worker listening for jobs on queue '${options.queueName}'`);
}

export default startWorker;