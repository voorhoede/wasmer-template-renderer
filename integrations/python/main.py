from wasmer import engine, Store, Module, Instance
from wasmer_compiler_cranelift import Compiler
from pathlib import Path

base_path = Path(__file__).parent
wasmFilePath = (base_path / '../../target/wasm32-unknown-unknown/debug/wasmer_template_renderer.wasm').resolve()
wasm = open(wasmFilePath, 'rb').read()

store = Store(engine.JIT(Compiler))
module = Module(store, wasm)
instance = Instance(module)

postTemplateFilePath = (base_path / '../shared/hbs/post.hbs').resolve()
jsonFilePath = (base_path / '../shared/json/data.json').resolve()

postTemplate = open(postTemplateFilePath, 'r').read()
json = open(jsonFilePath, 'r').read()

postTemplateUtf8 = bytes(postTemplate, 'utf-8')
jsonUtf8 = bytes(json, 'utf-8')

postTemplateUtf8Length = len(postTemplateUtf8)
jsonUtf8Length = len(jsonUtf8)

postTemplatePtr = instance.exports.alloc(postTemplateUtf8Length)
jsonPtr = instance.exports.alloc(jsonUtf8Length)

postTemplateMemory = instance.exports.memory.uint8_view(postTemplatePtr)
postTemplateMemory[0:postTemplateUtf8Length] = postTemplateUtf8

jsonMemory = instance.exports.memory.uint8_view(jsonPtr)
jsonMemory[0:jsonUtf8Length] = jsonUtf8

htmlPtr = instance.exports.render(postTemplatePtr, jsonPtr)

htmlMemory = instance.exports.memory.uint8_view(htmlPtr)
htmlMemoryLength = len(htmlMemory)

html = []
nth = 0

while nth < htmlMemoryLength:
    byte = htmlMemory[nth]

    if byte == 0:
        break

    html.append(byte)
    nth += 1

htmlLength = nth

print(bytes(html).decode())

instance.exports.dealloc(postTemplatePtr, postTemplateUtf8Length)
instance.exports.dealloc(jsonPtr, jsonUtf8Length)
instance.exports.dealloc(htmlPtr, htmlLength)
