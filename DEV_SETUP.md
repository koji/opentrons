# Development Environment Setup

This guide provides a set of opinionated instructions for setting up your computer to work on the software in Opentrons/opentrons. You can choose to set up your machine in a different way with different tools if you desire, but this setup is tested and recommended.

If you notice a discrepancy between these instructions and any instructions in the documentation of tools we reference below, please [file an issue][] or [open a pull request][]!

## System Setup

You will need the following tools installed to develop on the Opentrons platform.

- make
- git
- curl
- ssh
- zsh
- Python v3.7
- Node.js v16

### Ubuntu

#### 0. Install asdf

1. Go to [https://asdf-vm.com/][asdf]
2. Copy and run the install script
3. Follow any directions given to you by the install script

On macOS, we rely on:

- [Homebrew][brew] to install general dependencies, like `git`
- [Node Version Switcher][nvs] to install and manage Node.js
- [pyenv][] to install and manage Python

The setup below is compatible with both Intel and ARM (e.g. M1) machines. It assumes you are using the system default shell of `zsh`.

#### 0. Install `brew` and general dependencies

[Homebrew][brew] is a package manager for macOS, and it is useful to install language-agnostic development tools. Installing the `brew` command will also install the [Xcode Command Line tools][], which are required for development on macOS.

1. Go to [https://brew.sh][brew]
2. Follow the install guide


#### 1. Install `python` and `nodejs`

1. Install plugin
```zsh

# python
asdf plugin add python

# nodejs
asdf plugin add nodejs https://github.com/asdf-vm/asdf-nodejs.git
```

2. Install python and nodejs

```zsh
# python
asdf install python 3.7.15

# nodejs
asdf install nodejs 16.18.1
```

3. Set python version and nodejs version

```zsh
# python
asdf local python 3.7.15

# nodejs
asdf local nodejs 16.18.1
```

4. Install yarn
```shell
npm install --global yarn@1
```

Finally, you need to download and install all of our various development dependencies. **This step will take several minutes** the first time you run it!

```shell
make setup
```

Once `make setup` completes, you're ready to start developing!


Note
```zsh
export NODE_OPTIONS=--openssl-legacy-provider
```
