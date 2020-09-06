# github-init-cli

Create remote and local git repository

[![npm package][npm-version-badge]][npm-package]

## Install

```sh
$ npm install -g github-init-cli
```

## Usage

Log in with your GitHub username and [personal access token][personal-access-tokens] (will be persisted locally). </br>
Make sure that the access token has permissions (`repo`, `delete_repo`) to create (required) and delete (optional) repositories.

```sh
$ github login <username> <token>
```

Set custom working directory (default: `~/github`)

```sh
$ github setwd <path>
```

Create remote and local git repository

```sh
$ github create <name>
```

If installed, the project will be opened with [VS Code][vs-code].

## Contributing

[![contributions welcome][contributions-badge]][issues]

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.

[issues]: https://github.com/nflaig/github-init-cli/issues
[npm-package]: https://www.npmjs.com/package/github-init-cli
[npm-version-badge]: https://badge.fury.io/js/github-init-cli.svg
[contributions-badge]: https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat
[personal-access-tokens]: https://github.com/settings/tokens
[vs-code]: https://code.visualstudio.com/
