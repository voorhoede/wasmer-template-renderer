<?php

$currentDirPath = dirname(__FILE__);
require_once $currentDirPath . '/vendor/autoload.php';

class WasmHandlebars
{
    private $wasmTemplateRenderer;

    public function __construct(string $wasmFilePath)
    {
        $this->wasmTemplateRenderer = new Wasm\Instance($wasmFilePath);
    }

    public static function create(): WasmHandlebars
    {
        $currentDirPath = dirname(__FILE__);
        $wasmFilePath = realpath($currentDirPath . '/../../target/wasm32-unknown-unknown/debug/wasmer_template_renderer.wasm');
        return new WasmHandlebars($wasmFilePath);
    }

    public function registerPartial(string $name, string $template): void
    {
        $nameUtf8 = WasmHandlebars::nullTerminated($name);
        $templateUtf8 = WasmHandlebars::nullTerminated($template);

        $nameUtf8Length = count($nameUtf8);
        $templateUtf8Length = count($templateUtf8);

        $namePtr = $this->alloc($nameUtf8Length);
        $templatePtr = $this->alloc($templateUtf8Length);

        $this->writeToBuffer($namePtr, $nameUtf8);
        $this->writeToBuffer($templatePtr, $templateUtf8);

        $this->wasmTemplateRenderer->register_partial($namePtr, $templatePtr);

        $this->dealloc($namePtr, $nameUtf8Length);
        $this->dealloc($templatePtr, $templateUtf8Length);
    }

    public function render(string $name, string $data): string
    {
        $nameUtf8 = WasmHandlebars::nullTerminated($name);
        $dataUtf8 = WasmHandlebars::nullTerminated($data);

        $nameUtf8Length = count($nameUtf8);
        $dataUtf8Length = count($dataUtf8);

        $namePtr = $this->alloc($nameUtf8Length);
        $dataPtr = $this->alloc($dataUtf8Length);

        $this->writeToBuffer($namePtr, $nameUtf8);
        $this->writeToBuffer($dataPtr, $dataUtf8);

        $htmlPtr = $this->wasmTemplateRenderer->render($namePtr, $dataPtr);
        $html = $this->readString($htmlPtr);

        $this->dealloc($namePtr, $nameUtf8Length);
        $this->dealloc($dataPtr, $dataUtf8Length);
        $this->dealloc($htmlPtr, $html->stringBytesLength);

        return $html->string;
    }

    private static function nullTerminated(string $string): array
    {
        $utf8Encoded = utf8_encode($string);
        $stringBytes =  array_merge(unpack('C*', $utf8Encoded));
        array_push($stringBytes, 0);

        return $stringBytes;
    }

    private function writeToBuffer(int $ptr, array $stringBytes)
    {
        $memoryBuffer = $this->wasmTemplateRenderer->getMemoryBuffer();
        $memory = new Wasm\Uint8Array($memoryBuffer, $ptr);

        $stringBytesLength = count($stringBytes);

        for ($nth = 0; $nth < $stringBytesLength; ++$nth) {
            $memory[$nth] = $stringBytes[$nth];
        }
    }

    private function alloc(int $length): int
    {
        return $this->wasmTemplateRenderer->alloc($length);
    }

    private function dealloc(int $ptr, int $length)
    {
        $this->wasmTemplateRenderer->dealloc($ptr, $length);
    }

    private function readString(int $ptr): DecodedString
    {
        $memory_buffer = $this->wasmTemplateRenderer->getMemoryBuffer();
        $memory = new Wasm\Uint8Array($memory_buffer, $ptr);

        $string = '';
        $nth = 0;

        while (0 !== $memory[$nth]) {
            $string .= chr($memory[$nth]);
            ++$nth;
        }

        return new DecodedString(utf8_decode($string), $nth);
    }
}

class DecodedString
{
    public $string;
    public $stringBytesLength;

    public function __construct(string $string, int $stringBytesLength)
    {
        $this->string = $string;
        $this->stringBytesLength = $stringBytesLength;
    }
}
