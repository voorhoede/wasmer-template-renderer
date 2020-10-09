rm -rf output/

gradle run -p integrations/java
node integrations/js/node/example.js
php -d extension=wasm integrations/php/example.php
python integrations/python/example.python
cargo run --manifest-path integrations/rust/Cargo.toml