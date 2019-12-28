const { writeFileSync, readFileSync, existsSync, mkdirSync } = require("fs");
const { execSync } = require("child_process");
const Octokit = require("@octokit/rest");
const simpleGit = require("simple-git/promise")();

const homeDir = process.env.HOME;

const setCredentials = (username, password) => {
    console.log("Username: " + username);
    console.log("Password: " + password);
    const credentials = {
        username,
        password
    };
    writeFileSync(homeDir + "/.github.cred.json", JSON.stringify(credentials));
};

const setWorkingDir = (path) => {
    console.log("Working directory: " + path);
    const workingDir = {
        path
    };
    writeFileSync(homeDir + "/.github.dir.json", JSON.stringify(workingDir));
};

const create = async (repositoyName) => {
    // Try to load credentials from file
    let username, password;

    try {
        const credentials = JSON.parse(readFileSync(homeDir + "/.github.cred.json"));
        if (credentials.username) username = credentials.username;
        else throw new Error();
        if (credentials.password) password = credentials.password;
        else throw new Error();
    } catch (error) {
        console.log("Please set your GitHub credentials by running \n\n" + 
        "github-init-cli setCredentials <username> <password>");
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
        console.log("Unable to create GitHub repository - " + error.errors[0].message);
        if (error.errors[0].message !== "name already exists on this account") process.exit(1);
    }

    // Default working directory path
    let workingDirPath = homeDir + "/github";

    // Try to load working directory from file
    try {
        const workingDir = JSON.parse(readFileSync(homeDir + "/.github.dir.json"));
        if (workingDir.path) workingDirPath = workingDir.path;
        else throw new Error();
        console.log("Using custom working directoy " + workingDirPath);
    } catch (error) {
        console.log("Using default working directory " + workingDirPath);
    }

    const folderPath = workingDirPath + "/" + repositoyName;

    // Check if project already exists
    if (existsSync(folderPath)) {
        console.log("Unable to create local folder - " + `${folderPath} already exists`);
        process.exit(1);
    }

    // Create project folder
    mkdirSync(folderPath, { recursive: true });
    await simpleGit.cwd(folderPath);

    // Initialize git and set remote
    await simpleGit.init();
    await simpleGit.addRemote("origin", `https://github.com/${username}/${repositoyName}.git`);

    // Create readme
    writeFileSync(folderPath + "/README.md", "");

    // Initial commit
    await simpleGit.add(".");
    await simpleGit.commit("Initial commit");
    await simpleGit.push("origin", "master", {"--set-upstream": true});

    console.log("Successfully created local repository " + folderPath);

    // Open the project in VS Code
    execSync("code " + folderPath);

    process.exit(0);
};

exports.setCredentials = setCredentials;
exports.setWorkingDir = setWorkingDir;
exports.create = create;
