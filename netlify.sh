curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y

PATH=/root/.cargo/bin:$PATH

rustup target add wasm32-unknown-unknown

cargo build --target wasm32-unknown-unknown --release
