use wasmer_runtime::{error, imports, instantiate, Func, WasmPtr, Array};

type u8ArrayWasmPtr = WasmPtr<u8, Array>;

fn main() -> error::Result<()> {
    let wasm_bytes = include_bytes!("../../../target/wasm32-unknown-unknown/debug/wasmer_template_renderer.wasm");
    
    let import_object = imports! {};
    let instance = instantiate(wasm_bytes, &import_object)?;
    
    let wasm_instance_context = instance.context();
    let wasm_instance_memory = wasm_instance_context.memory(0);

    let post_template = include_str!("../../shared/hbs/post.hbs");
    let json = include_str!("../../shared/json/data.json");

    let post_template_length = post_template.len() as u32;
    let json_length = json.len() as u32;

    let alloc: Func<u32, u8ArrayWasmPtr> = instance.func("alloc")
        .expect("Function alloc not found");

    let post_template_ptr = alloc.call(post_template_length).unwrap();
    let json_ptr = alloc.call(json_length).unwrap();

    let memory_writer = post_template_ptr
        .deref(wasm_instance_memory, 0, post_template_length)
        .unwrap();

    for (i, b) in post_template.bytes().enumerate() {
        memory_writer[i].set(b);
    }

    let memory_writer = json_ptr
        .deref(wasm_instance_memory, 0, json_length)
        .unwrap();

    for (i, b) in json.bytes().enumerate() {
        memory_writer[i].set(b);
    }

    let render: Func<(u8ArrayWasmPtr, u8ArrayWasmPtr), u8ArrayWasmPtr> = instance.func("render")
        .expect("Function render not found");
    
    let html_ptr = render.call(post_template_ptr, json_ptr).unwrap();
    let html = html_ptr.get_utf8_string_with_nul(&wasm_instance_memory)
        .expect("Couldn't get html string");

    println!("{}", &html);
    
    let dealloc: Func<(u8ArrayWasmPtr, u32)> = instance.func("dealloc")
        .expect("Function dealloc not found");

    dealloc.call(post_template_ptr, post_template_length).unwrap();
    dealloc.call(json_ptr, json_length).unwrap();
    dealloc.call(html_ptr, html.len() as u32).unwrap();
        
    Ok(())
}