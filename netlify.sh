curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y

source ~/.cargo/env

rustup target add wasm32-unknown-unknown

cargo build --target wasm32-unknown-unknown 

cp target/wasm32-unknown-unknown/debug/wasmer_template_renderer.wasm functions/