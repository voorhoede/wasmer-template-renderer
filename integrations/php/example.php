<?php
declare(strict_types = 1);

error_reporting(E_ALL ^ E_WARNING);

$currentDirPath = dirname(__File__);

require_once $currentDirPath . '/vendor/autoload.php';

$wasmFilePath = realpath($currentDirPath . '/../../target/wasm32-unknown-unknown/debug/wasmer_template_renderer.wasm');

$instance = new Wasm\Instance($wasmFilePath);

$postTemplateFilePath = realpath($currentDirPath . '/../shared/hbs/post.hbs');
$jsonFilePath = realpath($currentDirPath . '/../shared/json/data.json');

$postTemplate = file_get_contents($postTemplateFilePath);
$json = file_get_contents($jsonFilePath);

$postTemplateLength = strlen($postTemplate);
$jsonLength = strlen($json);

$postTemplatePtr = $instance->alloc($postTemplateLength);
$jsonPtr = $instance->alloc($jsonLength);

$memory_buffer = $instance->getMemoryBuffer();
$postTemplateMemory = new Wasm\Uint8Array($memory_buffer, $postTemplatePtr);

for ($nth = 0; $nth < $postTemplateLength; ++$nth) {
    $postTemplateMemory[$nth] = ord($postTemplate[$nth]);
}

$jsonMemory = new Wasm\Uint8Array($memory_buffer, $jsonPtr);

for ($nth = 0; $nth < $jsonLength; ++$nth) {
    $jsonMemory[$nth] = ord($json[$nth]);
}

$htmlPtr = $instance->render($postTemplatePtr, $jsonPtr);
$htmlMemory = new Wasm\Uint8Array($memory_buffer, $htmlPtr);

$html = '';
$nth = 0;

while (0 !== $htmlMemory[$nth]) {
    $html .= chr($htmlMemory[$nth]);
    ++$nth;
}

$htmlLength = $nth;

echo $html, "\n";

$instance->dealloc($postTemplatePtr, $postTemplateLength);
$instance->dealloc($jsonPtr, $jsonLength);
$instance->dealloc($htmlPtr, $htmlLength);