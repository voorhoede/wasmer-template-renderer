FROM debian:10

WORKDIR /home

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

# Install Gradle
RUN apt install gradle -y

# Install Just
RUN curl --proto '=https' --tlsv1.2 -sSf https://just.systems/install.sh | sh -s -- -y

# Todo: don't copy Dockerfile
COPY . /home/wasmer-template-renderer

WORKDIR /home/wasmer-template-renderer
RUN cargo build --target wasm32-unknown-unknown

WORKDIR /home/wasmer-template-renderer/integrations/php/vendor/php-wasm/php-wasm
RUN just build

WORKDIR /home/wasmer-template-renderer/integrations/java
RUN gradle build

WORKDIR /home/wasmer-template-renderer/integrations/rust
RUN cargo build

WORKDIR /home/wasmer-template-renderer