# Wasmer template renderer

## About

Rendering Handlebars templates in different languages/environments with Wasm, using Wasmer. 

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
* [Just](https://github.com/casey/just)

### Java example
* [Java 11 JDK](https://www.oracle.com/java/technologies/javase-jdk11-downloads.html)
* [Gradle](https://gradle.org/install/)

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

### Running Java example
```sh
gradle run -p integrations/java
```
Note: Currently only working on Linux because of a bug in wasmer.

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
1. Install dependencies 
```sh
composer install -d integrations/php
```

2. Compile extension 
```sh
just integrations/php/vendor/php-wasm/php-wasm/build
```

3. Run example
```sh
php -d extension=wasm example.php
```

### Running Rust example
```sh
cargo run --manifest-path integrations/rust/Cargo.toml
```

## Project structure
    .
    ├── integrations                            # Examples of different languages/environments using the Wasm template renderer.
    │   │
    │   ├── java                                
    │   │   └── ../wasmhandlebars               
    │   │      ├── Test.java                    # Java example
    │   │      └── WasmHandlebars.java          # Java class using the Wasm module and Wasmer to render Handlebars templates. 
    │   │
    │   ├── js                                  
    │   │   ├── node                            # Node example
    │   │   ├── shared                          # Contains a JS class that uses the Wasm module to render Handlebars templates.
    │   │   └── web                             # Web example
    │   │
    │   ├── php                                 
    │   │   ├── test.php                        # PHP example
    │   │   └── WasmHandlebars.php              # PHP class that uses the Wasm module and Wasmer to render Handlebars templates.
    │   │
    │   ├── python                              
    │   │   ├── test.py                         # Python example
    │   │   └── wasm_handlebars.py              # Python class that uses the Wasm module and Wasmer to render Handlebars templates.
    │   │
    │   ├── rust                                
    │   │   └── src                             
    │   │      ├── main.rs                      # Rust example
    │   │      └── WasmHandlebars.java          # Rust Struct (and Implementation) using the Wasm module and Wasmer to render Handlebars templates.
    │   │
    │   └── shared                              # Contains files (Handlebars templates and JSON data) that are used by the examples of the different languages.   
    │
    ├── src                                     # Rust codebase for the Wasm template renderer.
    │   ├── lib.rs                              # Contains functions that are used by the Wasm module to interop with other programming languages.
    │   └── renderer.rs                         # Struct and Impl using handlebars-rust to register and render templates.
    │   
    └── Cargo.toml                              # Contains Rust dependencies for the Wasm module.
    
