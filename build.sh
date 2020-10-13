rm -rf output/

gradle run -p integrations/java
node integrations/js/node/test.js
php -d extension=wasm integrations/php/test.php
python3 integrations/python/test.py
cargo run --manifest-path integrations/rust/Cargo.toml