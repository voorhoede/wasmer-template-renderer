const fs = require("fs");
const path = require('path');

const WasmHandlebars = require('../../integrations/js/shared/wasm-handlebars');
const wasmFilePath = path.resolve(__dirname, './wasmer_template_renderer.wasm');
const wasmBytes = fs.readFileSync(wasmFilePath);

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const params = JSON.parse(event.body);
  
  const renderer = await new WasmHandlebars(wasmBytes).init();

  params.templates.forEach(({name, template}) => (
    renderer.registerPartial(name, template)
  ));

  const html = renderer.render(
    params.render.name, 
    JSON.stringify(params.render.data)
  );

  return {
    statusCode: 200,
    body: JSON.stringify(params),
  };
};