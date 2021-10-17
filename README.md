# Skyform
Skyform is a platform for managing Terraform deployments via CLI, inspired
by Terraform Cloud/Terraform Enterprise.

## Getting Started
Skyform has three main components:
- GraphQL API - serves client requests
- Scheduler - scheduling Terraform CLI commands, including `terraform plan` and `terraform apply`
- Worker(s) - executes Terraform CLI commands

Skyform uses the BullMQ library to handle job scheduling. BullMQ requires a Redis installation; the exact
address of the Redis server can be specified via a configuration file.

You can start the API using the `skyform api` command:
```shell script
skyform api
```

Start the scheduler using the `skyform scheduler` command:
```shell script
skyform scheduler
```

Finally, start the worker using the `skyform worker` command:
```shell script
skyform worker
```