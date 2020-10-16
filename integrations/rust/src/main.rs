mod wasm_handlebars;
use lazy_static::lazy_static;
use serde_json::Value;
use std::env;
use std::error::Error;
use std::fs;
use std::path::Path;
use std::path::PathBuf;
use wasm_handlebars::WasmHandlebars;

const LANG: &str = "rust";

lazy_static! {
    static ref current_dir_path: PathBuf = Path::new(env!("CARGO_MANIFEST_DIR")).to_path_buf();
    static ref root_dir_path: PathBuf = current_dir_path.join("../../").canonicalize().unwrap();
    static ref shared_dir_path: PathBuf =
        current_dir_path.join("../shared").canonicalize().unwrap();
    static ref config_file_path: PathBuf =
        root_dir_path.join("config.json").canonicalize().unwrap();
    static ref config: Value = {
        let contents = fs::read_to_string(config_file_path.as_path()).unwrap();
        serde_json::from_str(&contents).unwrap()
    };
    static ref output_dir_path: PathBuf = {
        root_dir_path
            .as_path()
            .join(config["outputDir"].as_str().unwrap())
            .join(LANG)
    };
}

fn save_file(path: &Path, filename: &str, contents: &str) {
    fs::create_dir_all(path);
    fs::write(path.join(filename), contents);
}

fn save_error(err: &str) {
    let filename = LANG.to_owned() + config["errorExt"].as_str().unwrap();
    save_file(output_dir_path.as_path(), &filename, err);
}

fn run() -> Result<(), Box<dyn Error>> {
    let blog_template_file_path = shared_dir_path.as_path().join("blog.hbs");
    let post_template_file_path = shared_dir_path.as_path().join("post.hbs");
    let json_file_path = shared_dir_path.as_path().join("post.json");

    let blog_template = fs::read_to_string(&blog_template_file_path)?;
    let post_template = fs::read_to_string(&post_template_file_path)?;
    let json = fs::read_to_string(&json_file_path)?;

    let renderer = WasmHandlebars::create();

    renderer.register_partial("blog", &blog_template)?;
    renderer.register_partial("post", &post_template)?;

    let html = renderer.render("blog", &json)?;

    save_file(output_dir_path.as_path(), "post.html", &html);

    Ok(())
}

fn main() {
    match run() {
        Ok(_) => {}
        Err(e) => save_error(&e.to_string()),
    }
}
