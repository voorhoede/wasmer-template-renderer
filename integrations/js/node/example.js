const {promises: fs} = require("fs");
const path = require('path');

(async () => {
    try {
        const wasmFilePath = path.resolve(__dirname, '../../../target/wasm32-unknown-unknown/debug/wasmer_template_renderer.wasm');
        const buffer = await fs.readFile(wasmFilePath);

        const {instance} = await WebAssembly.instantiate(buffer);
        const main = instance.exports;

        const postTemplateFilePath = path.resolve(__dirname, '../../shared/hbs/post.hbs');
        const jsonFilePath = path.resolve(__dirname, '../../shared/json/data.json');

        const postTemplate = await fs.readFile(postTemplateFilePath, "utf-8");
        const json = await fs.readFile(jsonFilePath, "utf-8");

        const postTemplateUtf8 = (new TextEncoder()).encode(postTemplate);
        const jsonUtf8 = (new TextEncoder()).encode(json);

        const postTemplateUtf8Length = postTemplateUtf8.length + 1;
        const jsonUtf8Length = jsonUtf8.length + 1;

        const postTemplatePtr = main.alloc(postTemplateUtf8Length);
        const jsonPtr = main.alloc(jsonUtf8Length);

        new Uint8Array(main.memory.buffer, postTemplatePtr, postTemplateUtf8Length).set(postTemplateUtf8);
        new Uint8Array(main.memory.buffer, jsonPtr, jsonUtf8Length).set(jsonUtf8);

        const htmlPtr = main.render(postTemplatePtr, jsonPtr);

        const memory = new Uint8Array(main.memory.buffer, htmlPtr);
        const htmlBytes = [];
        let nth = 0;

        for (const byte of memory) {
            if (byte === 0) break;

            htmlBytes.push(byte)
            nth++
        }

        const htmlLength = nth;
        const html = new TextDecoder().decode(new Uint8Array(htmlBytes));
        console.log(html)

        main.dealloc(postTemplatePtr, postTemplateUtf8Length);
        main.dealloc(jsonPtr, jsonUtf8Length);
        main.dealloc(htmlPtr, htmlLength);
    } catch (e) {
        console.log(e);
    }
})();