const { writeFileSync, readFileSync, mkdirSync } = require("fs");
const { execSync } = require("child_process");
const Octokit = require("@octokit/rest");

const homeDir = process.env.HOME;

const setCredentials = function(username, password) {
    console.log("Username: " + username);
    console.log("Password: " + password);
    const credentials = {
        username,
        password
    }
    writeFileSync(homeDir + "/.github.cred.json", JSON.stringify(credentials));
}

const setWorkingDir = function(path) {
    console.log("Working directory: " + path);
    const workingDir = {
        path
    }
    writeFileSync(homeDir + "/.github.dir.json", JSON.stringify(workingDir));
}

const create = async function(repositoyName) {
    // Try to load credentials from file
    let username, password;

    try {
        const credentials = JSON.parse(readFileSync(homeDir + "/.github.cred.json"));
        if(credentials.username) username = credentials.username;
        else throw new Error();
        if(credentials.password) password = credentials.password;
        else throw new Error();
    } catch {
        console.log("Please set your GitHub credentials by running \n\n" + 
        "github-init-cli setCredentials <username> <password>")
        process.exit(1);
    }
        
    // Create authenticated client
    const client = new Octokit({
        auth: {
            username,
            password
        }
    });
    
    // Create new remote repository
    try {
        await client.repos.createForAuthenticatedUser({
            name: repositoyName 
        });
        console.log("Successfully created GitHub repository " + `https://github.com/${username}/${repositoyName}.git`);
    } catch (error) {
        console.log(error);
    }

    // Default working directory path
    let workingDirPath = homeDir + "/github";

    // Try to load working directory from file
    try {
        const workingDir = JSON.parse(readFileSync(homeDir + "/.github.dir.json"));
        if(workingDir.path) workingDirPath = workingDir.path;
        else throw new Error();
        console.log("Using custom working directoy " + workingDirPath);
    } catch {
        console.log("Using default working directory " + workingDirPath);
    }

    // Create project folder
    const folderPath = workingDirPath + "/" + repositoyName;
    mkdirSync(folderPath, { recursive: true });

    // Initialize git and set remote
    const simpleGit = require('simple-git/promise')(folderPath);
    await simpleGit.init()
    await simpleGit.addRemote("origin", `https://github.com/${username}/${repositoyName}.git`)

    // Create readme
    writeFileSync(folderPath + "/README.md", "");

    // Initial commit
    await simpleGit.add(".")
    await simpleGit.commit("Initial commit")
    await simpleGit.push("origin", "master");

    console.log("Successfully created local repository " + folderPath);

    // Open the project in VS Code
    execSync("code " + folderPath);

    process.exit(0);
}

exports.setCredentials = setCredentials;
exports.setWorkingDir = setWorkingDir;
exports.create = create;