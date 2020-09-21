<?php
error_reporting(E_ALL ^ E_WARNING);
require __DIR__ . '/vendor/autoload.php';

$wasmFilePath = realpath('../../target/wasm32-unknown-unknown/debug/wasmer_template_renderer.wasm');

var_dump($wasmFilePath);

$instance = new Wasm\Instance($wasmFilePath);

var_dump($instance);
