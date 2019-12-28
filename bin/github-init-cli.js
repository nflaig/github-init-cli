#!/usr/bin/env node

const { setCredentials, setWorkingDir, create } = require("../lib/github-init-cli");

const args = process.argv.splice(process.execArgv.length + 2);

const command = args[0];

if (command === "setCredentials") setCredentials(args[1], args[2]);
else if (command === "setWorkingDir") setWorkingDir(args[1]);
else if (command === "create") create(args[1]);
else console.log("Unknown command");
