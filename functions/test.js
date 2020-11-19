const fs = require("fs");
const path = require('path');

const WasmHandlebars = require('../integrations/js/shared/wasm-handlebars');

const wasmFilePath = path.resolve('../wasmer_template_renderer.wasm');

const wasmBytes = fs.readFileSync(wasmFilePath);

function traverseDir(dir) {
  fs.readdirSync(dir).forEach(file => {
    let fullPath = path.join(dir, file);
    if (fs.lstatSync(fullPath).isDirectory()) {
       console.log(fullPath);
       traverseDir(fullPath);
     } else {
       console.log(fullPath);
     }  
  });
}

traverseDir(__dirname);

getDirectories('test', function (err, res) {
  if (err) {
    console.log('Error', err);
  } else {
    console.log(res);
  }
});

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
    body: html
  };
};