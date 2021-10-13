import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import startServer from "./server";
import Scheduler from "./scheduler";
import startWorker from "./worker";

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

export function cli(argv) {
  yargs(hideBin(argv))
    .command("api", "start the Skyform GraphQL API", yargs => yargs, api)
    .command("scheduler", "start the scheduler process", yargs => yargs, scheduler)
    .command("worker", "start the worker process", yargs => yargs, worker)
    .strictCommands()
    .demandCommand(1, "notes: please specify a command")
    .help()
    .parse();
}