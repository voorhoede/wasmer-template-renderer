const WasmHandlebars = require('../shared/wasm-handlebars');
const blogTemplate = require('../../shared/blog.hbs');
const postTemplate = require('../../shared/post.hbs');
const json = require('../../shared/post.json');

const run = async () => {
    try {
        const fetchPromise = fetch('public/wasmer_template_renderer.wasm');
        const renderer = await new WasmHandlebars(fetchPromise).init();

        renderer.registerPartial('post', postTemplate);
        renderer.registerPartial('blog', blogTemplate);

        const html = renderer.render('blog', JSON.stringify(json));

        const postElement = document.getElementById('post');
        postElement.innerHTML = html;
    } catch (err) {
        console.log(err);
    }
};

run();