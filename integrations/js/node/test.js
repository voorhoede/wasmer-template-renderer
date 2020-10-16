const { promises: fs } = require("fs");
const path = require('path');

const WasmHandlebars = require('../shared/wasm-handlebars');

const LANG = 'js';
const rootDirPath = path.resolve(__dirname, '../../..');
const sharedDirPath = path.resolve(__dirname, '../../shared');
const config = require(rootDirPath + '/config.json');
const outputDirPath = rootDirPath + '/' + config.outputDir + LANG + '/';
const wasmFilePath = rootDirPath + '/target/wasm32-unknown-unknown/debug/wasmer_template_renderer.wasm';

const blogTemplateFilePath = sharedDirPath + '/blog.hbs';
const postTemplateFilePath = sharedDirPath + '/post.hbs';
const postJsonFilePath = sharedDirPath + '/post.json';

const saveFile = async (path, filename, contents) => {
    try {
        await fs.mkdir(path, { recursive: true });
        await fs.writeFile(path + '/' + filename, contents);
    } catch (err) {
        console.log(err)
    }
};

const saveError = async (err) => {
    try {
        const errorFilename = LANG + config.errorExt;
        await saveFile(outputDirPath, errorFilename, err);
    } catch (err) {
        console.log(err)
    }
};

const run = async () => {
    try {
        const blogTemplate = await fs.readFile(blogTemplateFilePath, "utf-8");
        const postTemplate = await fs.readFile(postTemplateFilePath, "utf-8");
        const json = await fs.readFile(postJsonFilePath, "utf-8");
        const wasmBytes = await fs.readFile(wasmFilePath);

        const renderer = await new WasmHandlebars(wasmBytes).init();

        renderer.registerPartial('post', postTemplate);
        renderer.registerPartial('blog', blogTemplate);

        const html = renderer.render('blog', json);
        await saveFile(outputDirPath, 'post.html', html);
    } catch (err) {
        console.log(err);
        await saveError(err.message);
    }
};

run();

