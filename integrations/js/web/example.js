const TemplateRenderer = require('../shared/template-renderer');
const postTemplate = require('../../shared/post.hbs');
const json = require('../../shared/post.json');

const run = async () => {
    try {
        const fetchPromise = fetch('public/wasmer_template_renderer.wasm');
        const templateRenderer = await new TemplateRenderer(fetchPromise).init();

        const html = templateRenderer.render(postTemplate, JSON.stringify(json));

        const postElement = document.getElementById('post');
        postElement.innerHTML = html;
    } catch (err) {
        console.log(err);
    }
};

run();