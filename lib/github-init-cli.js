const { writeFileSync, readFileSync, existsSync, mkdirSync } = require("fs");
const { execSync } = require("child_process");
const { Octokit } = require("@octokit/rest");
const simpleGit = require("simple-git")();
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


const setCredentials = (username, token) => {
    if(!username) {
        logger.error("Username not provided");
        process.exit(1);
    }
    if(!token) {
        logger.error("Token not provided");
        process.exit(1);
    }

    const credentials = {
        username,
        token
    };
    writeFileSync(homeDir + "/.github.cred.json", JSON.stringify(credentials));
    logger.info("Username = " + info(username));
    logger.info("Token = " + info(token));
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
    let username, token;

    try {
        const credentials = JSON.parse(readFileSync(homeDir + "/.github.cred.json"));
        if (credentials.username) username = credentials.username;
        else throw new Error();
        if (credentials.token) token = credentials.token;
        else if(credentials.password) {
            logger.error("Using password authentication is no longer supported");
            logger.info(`Please use a personal access token with ${info("repo")} and ${info("delete_repo")} permissions`);
            logger.info(`Replace your password with a personal access token by running ${info("github login <username> <token>")}`);
            process.exit(1);
        }
        else throw new Error();
    } catch (error) {
        logger.error("Unable to load credentials");
        logger.info(`Please log in with your username and personal access token by running ${info("github login <username> <token>")}`);
        process.exit(1);
    }
        
    // Create authenticated client
    const client = new Octokit({
        auth: token
    });
    
    // Create new remote repository
    try {
        await client.repos.createForAuthenticatedUser({
            name: repositoryName 
        });
        logger.success(`Created GitHub repository ${info(`https://github.com/${username}/${repositoryName}.git`)}`);
    } catch (error) {
        if (error.status === 401) {
            logger.error("Invalid GitHub credentials");
            process.exit(1);
        } else {
            logger.error(`Unable to create GitHub repository - ${error.errors ? error.errors[0].message : error.message}`);
            if (error.status !== 422) {
                logger.info(`Please make sure that the personal access token has the required permissions ${info("repo")} and ${info("delete_repo")}`);
            }
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
        logger.info(`Using custom working directoy ${info(workingDirPath)}`);
    } catch (error) {
        logger.info(`Using default working directory ${info(workingDirPath)}`);
    }

    const folderPath = workingDirPath + "/" + repositoryName;

    // Check if project already exists
    if (existsSync(folderPath)) {
        logger.error(`Unable to create local folder - ${folderPath} already exists`);

        try {
            await client.repos.delete({
                owner: username, 
                repo: repositoryName
            });

            logger.info(`Removed GitHub repository ${info(`https://github.com/${username}/${repositoryName}.git`)}`);
        } catch (error) {
            logger.error(`Unable to delete GitHub repository - ${error.message}`);
            logger.info(`Repository ${info(`https://github.com/${username}/${repositoryName}.git`)} has to be manually deleted`);
        }

        process.exit(1);
    }

    // Create project folder
    mkdirSync(folderPath, { recursive: true });
    await simpleGit.cwd(folderPath);

    // Initialize git and set remote
    await simpleGit.init();
    await simpleGit.addRemote("origin", `git@github.com:${username}/${repositoryName}.git`);

    // Create readme
    writeFileSync(folderPath + "/README.md", `# ${repositoryName}\n`);

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
