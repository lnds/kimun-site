---
title: "Installation"
description: "Install the km binary and the completions for your shell."
---

```bash
cargo install kimun              # from crates.io
brew install lnds/kimun/kimun    # with Homebrew, on macOS and Linux
```

Either one installs the `km` binary. There are also ready-made binaries for macOS, Linux and Windows on the [releases page](https://github.com/lnds/kimun/releases). From a checkout of the [repository](https://github.com/lnds/kimun), `cargo install --path .` builds it from source.

## Shell completions

Generate and install a completion script for your shell:

```bash
# zsh
km completions zsh > ~/.zfunc/_km
# add to ~/.zshrc if not already present:
#   fpath=(~/.zfunc $fpath)
#   autoload -Uz compinit && compinit

# bash
km completions bash > /etc/bash_completion.d/km

# fish
km completions fish > ~/.config/fish/completions/km.fish
```
