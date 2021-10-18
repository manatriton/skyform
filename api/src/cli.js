const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const startServer = require("./server");
const Scheduler = require("./scheduler");
const startWorker = require("./worker");

function api() {
  startServer();
}

async function scheduler(args) {
  const scheduler = new Scheduler();
  await scheduler.run();
}

function worker(args) {
  startWorker();
}

function cli(argv) {
  yargs(hideBin(argv))
    .command("api", "start the Skyform GraphQL API", yargs => yargs, api)
    .command("scheduler", "start the scheduler process", yargs => yargs, scheduler)
    .command("worker", "start the worker process", yargs => yargs, worker)
    .strictCommands()
    .demandCommand(1, "notes: please specify a command")
    .help()
    .parse();
}

module.exports = { cli };