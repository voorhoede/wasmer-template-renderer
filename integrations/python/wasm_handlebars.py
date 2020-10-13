from wasmer import engine, Store, Module, Instance
from wasmer_compiler_cranelift import Compiler
from pathlib import Path


class _DecodedString:
    def __init__(self, string: str, string_bytes_length: int):
        self.string = string
        self.string_bytes_length = string_bytes_length


class WasmHandlebars:

    def __init__(self, wasm_bytes: bytes):
        store = Store(engine.JIT(Compiler))
        module = Module(store, wasm_bytes)
        self.__wasm_template_renderer = Instance(module)

    @staticmethod
    def create():
        base_path = Path(__file__).parent
        wasm_file_path = (
            base_path / '../../target/wasm32-unknown-unknown/debug/wasmer_template_renderer.wasm').resolve()
        wasm_bytes = wasm_bytes = open(wasm_file_path, 'rb').read()

        return WasmHandlebars(wasm_bytes)

    def register_partial(self, name: str, template: str):
        name_utf8 = WasmHandlebars.__null_terminated(name)
        template_utf8 = WasmHandlebars.__null_terminated(template)

        name_utf8_length = len(name_utf8)
        template_utf8_length = len(template_utf8)

        name_ptr = self.__alloc(name_utf8_length)
        template_ptr = self.__alloc(template_utf8_length)

        self.__write_to_buffer(name_ptr, name_utf8)
        self.__write_to_buffer(template_ptr, template_utf8)

        self.__register_partial(name_ptr, template_ptr)

        self.__dealloc(name_ptr, name_utf8_length)
        self.__dealloc(template_ptr, template_utf8_length)

    def render(self, name: str, data: str) -> str:
        name_utf8 = WasmHandlebars.__null_terminated(name)
        data_utf8 = WasmHandlebars.__null_terminated(data)

        name_utf8_length = len(name_utf8)
        data_utf8_length = len(data_utf8)

        name_ptr = self.__alloc(name_utf8_length)
        data_ptr = self.__alloc(data_utf8_length)

        self.__write_to_buffer(name_ptr, name_utf8)
        self.__write_to_buffer(data_ptr, data_utf8)

        html_ptr = self.__render(name_ptr, data_ptr)
        html = self.__readString(html_ptr)

        self.__dealloc(name_ptr, name_utf8_length)
        self.__dealloc(data_ptr, data_utf8_length)
        self.__dealloc(html_ptr, html.string_bytes_length)

        return html.string

    @staticmethod
    def __null_terminated(string: str) -> bytes:
        string_bytes = bytearray(string, 'utf-8')
        string_bytes.append(0)
        return bytes(string_bytes)

    def __alloc(self, length: int) -> int:
        return self.__wasm_template_renderer.exports.alloc(length)

    def __dealloc(self, ptr: int, length: int):
        self.__wasm_template_renderer.exports.dealloc(ptr, length)

    def __write_to_buffer(self, ptr: int, data: bytes):
        memory = self.__wasm_template_renderer.exports.memory.uint8_view(ptr)
        data_length = len(data)
        memory[0:data_length] = data

    def __register_partial(self, namePtr: int, templatePtr: int):
        self.__wasm_template_renderer.exports.register_partial(
            namePtr, templatePtr)

    def __render(self, namePtr: int, dataPtr: int) -> int:
        return self.__wasm_template_renderer.exports.render(namePtr, dataPtr)

    def __readString(self, ptr: int) -> _DecodedString:
        memory = self.__wasm_template_renderer.exports.memory.uint8_view(ptr)
        memory_length = len(memory)
        html_bytes = []
        nth = 0

        while nth < memory_length:
            byte = memory[nth]

            if byte == 0:
                break

            html_bytes.append(byte)
            nth += 1

        return _DecodedString(bytes(html_bytes).decode(), nth)
