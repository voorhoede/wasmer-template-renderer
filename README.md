# Wasmer template renderer

## About

Rendering Handlebars templates in different languages/environments with Wasm, using Wasmer. 

Credits to Remco for the idea.

## Built With
* [handlebars-rust](https://github.com/sunng87/handlebars-rust)
* [serde-json](https://github.com/serde-rs/json)

## Prerequisites

### Compiling Wasm
* [Rust](https://www.rust-lang.org/tools/install)
* [rustup](https://rustup.rs/)

### Node.js example
* [Node.js](https://nodejs.org/en/)

### Python example
* [Python 3](https://www.python.org/downloads/)
* [Wasmer 1.0.0a3](https://pypi.org/project/wasmer/1.0.0a3/)
* [Wasmer Compiler Cranelift 1.0.0-alpha3](https://pypi.org/project/wasmer-compiler-cranelift/1.0.0-alpha3/)

## Usage

### Compiling Wasm module
1. Install Wasm template renderer dependencies
```sh
cargo install
```

2. Add wasm32-unknown-unknown target
```sh
rustup target add wasm32-unknown-unknown
```

3. Compile Wasm module
```sh
cargo build
```

### Running Node.js example
```sh
node integrations/js/node/example.js
```

### Running Python example
```sh
python integrations/python/example.py
```
