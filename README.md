# github-init-cli

Create remote and local git repository

[![npm package](https://badge.fury.io/js/github-init-cli.svg)](https://www.npmjs.com/package/github-init-cli)

## Install

```sh
$ npm install -g github-init-cli
```

## Usage

Log in with your GitHub credentials (will be persisted locally)

```sh
$ github login <username> <password>
```

Set custom working directory (default: `~/github`)

```sh
$ github setwd <path>
```

Create remote and local git repository

```sh
$ github create <name>
```

If installed, the project will be opened with [VS Code](https://code.visualstudio.com/).

## Contributing

[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/nflaig/github-init-cli/issues)

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.