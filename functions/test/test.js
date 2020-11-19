const fs = require("fs");
const path = require('path');
const querystring = require("querystring");

const WasmHandlebars = require('../../integrations/js/shared/wasm-handlebars');
const wasmFilePath = path.resolve(__dirname, './wasmer_template_renderer.wasm');
const wasmBytes = fs.readFileSync(wasmFilePath);

exports.handler = async (event) => {

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const params = querystring.parse(event.body);

  // const renderer = await new WasmHandlebars(wasmBytes).init();
  // renderer.registerPartial('post', template);
  // const html = renderer.render('post', data);

  return {
    statusCsode: 200,
    body: JSON.stringify(params),
  };
};