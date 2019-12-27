# github-init-cli

Create remote and local git repository

## Install

```sh
$ npm install -g github-init-cli
```


## Usage

Set GitHub credentials

```sh
$ github-init-cli setCredentials <username> <password>
```

Set custom working directory (default: `~/github`)

```sh
$ github-init-cli setWorkingDir <path>
```

Create remote and local git repository

```sh
$ github-init-cli create <name>
```

If installed, the project will be automatically opened in VS Code.

## Issues

Report issues [here](https://github.com/nflaig/github-init-cli/issues)

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.