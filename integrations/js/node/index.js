const {promises: fs} = require("fs");
const path = require('path');

(async () => {
    try {
        const wasmFilePath = path.resolve(__dirname, '../../../target/wasm32-unknown-unknown/debug/wasmer_template_renderer.wasm');
        const buffer = await fs.readFile(wasmFilePath);
        const {instance} = await WebAssembly.instantiate(buffer);
        const main = instance.exports;

        const str1 = `
            <div>
                <h2>{{ title }}</h2>
                <p>Likes: {{ likes }}</p>
                <ul>
                    {{#each likedBy}}
                        <li>{{this}}</li>
                    {{/each}}
                </ul>
                {{#if public}}
                    <p>This post is public</p>
                {{else}}
                    <p>This post is private</p>
                {{/if}}
                {{{ data.html }}}
            </div>
        `;

        const str2 = `{
            "blogger": "Arash",
            "title": "Rendering from Wasm",
            "likes": 5,
            "public": false,
            "data": {
                "html": "<p><strong>Wasm!</strong></p>"
            },
            "likedBy": ["Remco", "Arash"]
        }`;

        const str1Utf8 = (new TextEncoder()).encode(str1);
        const str2Utf8 = (new TextEncoder()).encode(str2);

        const str1Utf8Length = str1Utf8.length;
        const str2Utf8Length = str2Utf8.length;

        const str1Ptr = main.alloc(str1Utf8Length);
        const str2Ptr = main.alloc(str2Utf8Length);

        new Uint8Array(main.memory.buffer, str1Ptr, str1Utf8Length).set(str1Utf8);
        new Uint8Array(main.memory.buffer, str2Ptr, str2Utf8Length).set(str2Utf8);

        const htmlPtr = main.test(str1Ptr, str2Ptr);
        const memory = new Uint8Array(main.memory.buffer, htmlPtr);
        const memoryLength = memory.length;

        const html = [];
        let nth = 0

        while (nth < memoryLength) {
            const byte = memory[nth];

            if (byte === 0) {
                break;
            }

            html.push(byte)
            nth++
        }

        console.log(new TextDecoder().decode(new Uint8Array(html)))

        // Free the WASM memory buffer.
        main.dealloc(str1Ptr, str1Utf8Length);
        main.dealloc(str2Ptr, str2Utf8Length);
    } catch (e) {
        console.log(e);
    }
})();