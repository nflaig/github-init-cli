const { writeFileSync, readFileSync, existsSync, mkdirSync } = require("fs");
const { execSync } = require("child_process");
const Octokit = require("@octokit/rest");
const simpleGit = require("simple-git/promise")();
const chalk = require("chalk");

const homeDir = process.env.HOME;

const info = chalk.bold.cyan;
const success = chalk.bold.green;
const warning = chalk.bold.yellow;
const error = chalk.bold.red;

const logger = {
    info: (message) => console.log(info("[INFO]: ") + message),
    success: (message) => console.log(success("[SUCCESS]: ") + message),
    warning: (message) => console.log(warning("[WARNING]: ") + message),
    error: (message) => console.log(error("[ERROR]: ") + message),
};


const setCredentials = (username, password) => {
    if(!username) {
        logger.error("Username not provided");
        process.exit(1);
    }
    if(!password) {
        logger.error("Password not provided");
        process.exit(1);
    }

    const credentials = {
        username,
        password
    };
    writeFileSync(homeDir + "/.github.cred.json", JSON.stringify(credentials));
    logger.info("Username = " + info(username));
    logger.info("Password = " + info(password));
};

const setWorkingDir = (path) => {
    const workingDir = {
        path
    };
    writeFileSync(homeDir + "/.github.dir.json", JSON.stringify(workingDir));
    logger.info("Working directory = " + info(path));
};

const createRepository = async (repositoryName) => {
    // Try to load credentials from file
    let username, password;

    try {
        const credentials = JSON.parse(readFileSync(homeDir + "/.github.cred.json"));
        if (credentials.username) username = credentials.username;
        else throw new Error();
        if (credentials.password) password = credentials.password;
        else throw new Error();
    } catch (error) {
        logger.error("Unable to load credentials");
        logger.info("Please log in with your GitHub credentials by running " + info("github login <username> <password>"));
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
            name: repositoryName 
        });
        logger.success("Created GitHub repository " + info(`https://github.com/${username}/${repositoryName}.git`));
    } catch (error) {
        if (error.status === 401) {
            logger.error("Invalid GitHub credentials");
            process.exit(1);
        } else {
            logger.error("Unable to create GitHub repository - " + error.errors[0].message);
            process.exit(1);
        }
    }

    // Default working directory path
    let workingDirPath = homeDir + "/github";

    // Try to load working directory from file
    try {
        const workingDir = JSON.parse(readFileSync(homeDir + "/.github.dir.json"));
        if (workingDir.path) workingDirPath = workingDir.path;
        else throw new Error();
        logger.info("Using custom working directoy " + info(workingDirPath));
    } catch (error) {
        logger.info("Using default working directory " + info(workingDirPath));
    }

    const folderPath = workingDirPath + "/" + repositoryName;

    // Check if project already exists
    if (existsSync(folderPath)) {
        await client.repos.delete({
            owner: username, 
            repo: repositoryName
        });
        logger.error("Unable to create local folder - " + `${folderPath} already exists`);
        logger.info("Removed GitHub repository " + info(`https://github.com/${username}/${repositoryName}.git`));
        process.exit(1);
    }

    // Create project folder
    mkdirSync(folderPath, { recursive: true });
    await simpleGit.cwd(folderPath);

    // Initialize git and set remote
    await simpleGit.init();
    await simpleGit.addRemote("origin", `https://github.com/${username}/${repositoryName}.git`);

    // Create readme
    writeFileSync(folderPath + "/README.md", "");

    // Initial commit
    await simpleGit.add(".");
    await simpleGit.commit("Initial commit");
    await simpleGit.push("origin", "master", {"--set-upstream": true});

    logger.success("Created local repository " + info(folderPath));

    // Try to open the project in VS Code
    try {
        execSync("code " + folderPath);
    } catch (error) {
        logger.warning("Unable to open the project in VS Code");
        process.exit(1);
    }

    process.exit(0);
};

exports.logger = logger;
exports.setCredentials = setCredentials;
exports.setWorkingDir = setWorkingDir;
exports.createRepository = createRepository;
