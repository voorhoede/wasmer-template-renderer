# Wasmer template renderer

## About

Rendering Handlebars templates in different languages/environments with Wasm, using Wasmer. 

Credits to Remco for the idea.

## Built With
* [handlebars-rust](https://github.com/sunng87/handlebars-rust)
* [serde-json](https://github.com/serde-rs/json)
* [lazy_static](https://github.com/rust-lang-nursery/lazy-static.rs)
* [mut_static](https://github.com/tyleo/mut_static)

## Prerequisites

### Compiling Wasm & Rust example
* [Rust](https://www.rust-lang.org/tools/install)
* [rustup](https://rustup.rs/)

### Node.js & web examples
* [Node.js](https://nodejs.org/en/)

### Python example
* [Python 3](https://www.python.org/downloads/)
* [Wasmer 1.0.0a3](https://pypi.org/project/wasmer/1.0.0a3/)
* [Wasmer Compiler Cranelift 1.0.0-alpha3](https://pypi.org/project/wasmer-compiler-cranelift/1.0.0-alpha3/)

### PHP example
* [PHP](https://www.php.net/downloads)
* [Composer](https://getcomposer.org/download/)

## Usage

### Compiling Wasm module
1. Add wasm32-unknown-unknown target
```sh
rustup target add wasm32-unknown-unknown
```

2. Compile Wasm module
```sh
cargo build --target wasm32-unknown-unknown
```

### Running Node.js example
```sh
node integrations/js/node/example.js
```

### Running web example
1. Change directory
```sh
cd integrations/js
```

2. Install dependencies 
```sh
npm install
```

3. Run example
```sh
npm run web:dev
```

### Running Python example
```sh
python3 integrations/python/example.py
```

### Running PHP example
1. Change directory
```sh
cd integrations/php
```

2. Install dependencies 
```sh
composer install
```

3. Run example
```sh
php -d extension=wasm example.php
```

### Running Rust example
1. Change directory
```sh
cd integrations/rust
```

2. Run example
```sh
cargo run
```

## Project structure
    .
    ├── integrations            # Contains examples of different languages/environments using the Wasm template renderer
    │   ├── js                  # Js examples for Node.js and web
    │   ├── python              # Python example
    │   ├── php                 # PHP example
    │   ├── rust                # Rust example
    │   └── shared              # Contains files that are shared between the languages
    │       ├── hbs             # Handlebars templates
    │       └── json            # JSON data
    ├── src                     # Rust codebase for Wasm.
    │   └── lib.rs              # Contains the Wasm logic for rendering templates with Handlebars.
    └── Cargo.toml              # Contains Rust dependencies for Wasm.
