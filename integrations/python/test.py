from pathlib import Path
import json
import os
from wasm_handlebars import WasmHandlebars

lang = 'python'
current_dir_path = Path(__file__).parent.resolve()
root_dir_path = Path(current_dir_path, '../../').resolve()
shared_dir_path = Path(current_dir_path, '../shared').resolve()
config_file_path = Path(root_dir_path, 'config.json').resolve()
config = json.load(open(config_file_path))
output_dir_path = str(root_dir_path) + '/' + config['outputDir'] + lang


def saveFile(path: str, filename: str, contents: str):
    try:
        os.makedirs(path, exist_ok=True)
        f = open(Path(path, filename).resolve(), 'w')
        f.write(contents)
        f.close()
    except EnvironmentError as err:
        print(err)


def saveError(err: str):
    filename = lang + config['errorExt']
    saveFile(output_dir_path, filename, err)


def run():
    try:
        blogTemplateFilePath = Path(shared_dir_path, 'blog.hbs').resolve()
        postTemplateFilePath = Path(shared_dir_path, 'post.hbs').resolve()
        jsonFilePath = Path(shared_dir_path, 'post.json').resolve()

        blogTemplate = open(blogTemplateFilePath, 'r').read()
        postTemplate = open(postTemplateFilePath, 'r').read()
        json = open(jsonFilePath, 'r').read()

        renderer = WasmHandlebars.create()

        renderer.register_partial('blog', blogTemplate)
        renderer.register_partial('post', postTemplate)

        html = renderer.render('blog', json)
        saveFile(output_dir_path, 'post.html', html)
    except Exception as e:
        print(str(e))
        saveError(str(e))


run()
