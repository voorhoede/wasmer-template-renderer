<?php
error_reporting(E_ALL ^ E_WARNING);

require __DIR__ . '/vendor/autoload.php';

$instance = new Wasm\Instance(__DIR__ . '/wasmer_template_renderer.wasm');

var_dump($instance);
