const fs = require("fs");
const path = require('path');

const WasmHandlebars = require('../integrations/js/shared/wasm-handlebars');

const wasmFilePath = path.resolve('./wasmer_template_renderer.wasm');

const wasmBytes = fs.readFileSync(wasmFilePath);

const template = `<div>
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
</div>`;

const data = `{
  "author": "Arash",
  "title": "Rendering from Wasm",
  "likes": 5,
  "likedBy": [
    "Remco",
    "Arash"
  ],
  "public": true,
  "data": {
    "html": "<p><strong>Wasm!</strong></p>"
  }
}`;

exports.handler = async (event, context) => {
  const renderer = await new WasmHandlebars(wasmBytes).init();

  renderer.registerPartial('post', template);
  const html = renderer.render('post', data);

  return {
    statusCode: 200,
    body: html,
  };
};