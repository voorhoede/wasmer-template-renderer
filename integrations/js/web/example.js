(async () => {
    try {
        const fetchPromise = fetch('public/wasmer_template_renderer.wasm');
        const {instance} = await WebAssembly.instantiateStreaming(fetchPromise);
        const main = instance.exports;

        const postTemplate = `
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

        const json = `{
            "blogger": "Arash",
            "title": "Rendering from Wasm",
            "likes": 5,
            "public": false,
            "data": {
                "html": "<p><strong>Wasm!</strong></p>"
            },
            "likedBy": ["Remco", "Arash"]
        }`;

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

        const postElement = document.getElementById('post');
        postElement.innerHTML = html;

        main.dealloc(postTemplatePtr, postTemplateUtf8Length);
        main.dealloc(jsonPtr, jsonUtf8Length);
        main.dealloc(htmlPtr, htmlLength);
    } catch (e) {
        console.log(e)
    }
})();