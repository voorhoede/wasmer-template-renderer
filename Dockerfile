FROM debian:10

RUN apt update
RUN apt install build-essential curl dirmngr apt-transport-https lsb-release ca-certificates -y

# Install Rust with rustup
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH=/root/.cargo/bin:$PATH

# Install Wasm toolchain with rustup
RUN rustup target add wasm32-unknown-unknown

# Install Node.js
RUN curl -sL https://deb.nodesource.com/setup_12.x | bash -
RUN apt install nodejs -y

# Install Python, pip and dependencies
RUN apt install python3-pip -y
RUN pip3 install wasmer==1.0.0a3 wasmer-compiler-cranelift==1.0.0-alpha3

# Install PHP
RUN apt install php7.3-dev -y
RUN curl -sS https://getcomposer.org/installer -o composer-setup.php
RUN php composer-setup.php --install-dir=/usr/local/bin --filename=composer
RUN rm composer-setup.php

# Install Gradle
RUN apt install gradle -y

# Install Just
RUN curl --proto '=https' --tlsv1.2 -sSf https://just.systems/install.sh | sh -s -- -y

# Copy project
COPY . /home/wasmer-template-renderer

# Set default working directory
WORKDIR /home/wasmer-template-renderer

# Compile Wasm module
RUN cargo build --target wasm32-unknown-unknown

# Install PHP dependencies
RUN composer install -d integrations/php

# Compile PHP extension   
RUN just integrations/php/vendor/php-wasm/php-wasm/build

# Compile Java example
RUN gradle build -p integrations/java

# Compile Rust example
RUN cargo build --manifest-path integrations/rust/Cargo.toml