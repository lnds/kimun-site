---
title: "Instalación"
description: "Instala el binario km y el autocompletado para tu shell."
---

```bash
cargo install kimun              # desde crates.io
brew install lnds/kimun/kimun    # con Homebrew, en macOS y Linux
```

Cualquiera de los dos instala el binario `km`. También hay binarios listos para macOS, Linux y Windows en la [página de releases](https://github.com/lnds/kimun/releases). Desde una copia del [repositorio](https://github.com/lnds/kimun), `cargo install --path .` lo compila desde el código fuente.

## Autocompletado para el shell

Genera e instala un script de autocompletado para tu shell:

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
