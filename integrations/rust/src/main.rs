mod wasm_handlebars;

use wasm_handlebars::WasmHandlebars;

fn main() {
    let blog_template = include_str!("../../shared/blog.hbs");
    let post_template = include_str!("../../shared/post.hbs");
    let json = include_str!("../../shared/post.json");

    let renderer = WasmHandlebars::create();

    renderer.register_partial("blog", blog_template);
    renderer.register_partial("post", post_template);

    let html = renderer.render("blog", json);

    println!("{}", html);
}
