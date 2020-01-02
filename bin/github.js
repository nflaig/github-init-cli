#!/usr/bin/env node

const { setCredentials, setWorkingDir, createRepository, logger } = require("../lib/github-init-cli");

const args = process.argv.splice(process.execArgv.length + 2);

const command = args[0];

if (["login", "setCredentials"].includes(command)) setCredentials(args[1], args[2]);
else if (["setwd", "setWorkingDir"].includes(command)) setWorkingDir(args[1]);
else if (["create", "createRepository"].includes(command)) createRepository(args[1]);
else logger.error("Unknown command");
