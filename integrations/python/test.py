from pathlib import Path
from wasm_handlebars import WasmHandlebars

base_path = Path(__file__).parent

blogTemplateFilePath = (base_path / '../shared/blog.hbs').resolve()
postTemplateFilePath = (base_path / '../shared/post.hbs').resolve()
jsonFilePath = (base_path / '../shared/post.json').resolve()

blogTemplate = open(blogTemplateFilePath, 'r').read()
postTemplate = open(postTemplateFilePath, 'r').read()
json = open(jsonFilePath, 'r').read()

renderer = WasmHandlebars.create()

renderer.register_partial('blog', blogTemplate)
renderer.register_partial('post', postTemplate)

html = renderer.render('blog', json)

print(html)
