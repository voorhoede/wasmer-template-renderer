use std::str;
use wasmer_runtime::{imports, instantiate, Array, Func, Instance, WasmPtr};

type U8arrayWasmPtr = WasmPtr<u8, Array>;

static WASM: &'static [u8] =
    include_bytes!("../../../target/wasm32-unknown-unknown/debug/wasmer_template_renderer.wasm");
pub struct WasmHandlebars {
    wasm_handlebars: Instance,
}

impl WasmHandlebars {
    pub fn new(wasm_bytes: &'static [u8]) -> Self {
        let import_object = imports! {};
        let instance = instantiate(wasm_bytes, &import_object).unwrap();
        WasmHandlebars {
            wasm_handlebars: instance,
        }
    }

    pub fn create() -> Self {
        WasmHandlebars::new(WASM)
    }

    pub fn register_partial(&self, name: &str, template: &str) {
        let name = WasmHandlebars::null_terminated(name);
        let template = WasmHandlebars::null_terminated(template);

        let name_length = name.len() as u32;
        let template_length = template.len() as u32;

        let name_ptr = self.alloc(name_length);
        let template_ptr = self.alloc(template_length);

        self.write_to_buffer(name_ptr, &name.as_slice());
        self.write_to_buffer(template_ptr, &template.as_slice());

        self._register_partial(name_ptr, template_ptr);

        self.dealloc(name_ptr, name_length);
        self.dealloc(template_ptr, template_length);
    }

    pub fn render(&self, name: &str, data: &str) -> &str {
        let name = WasmHandlebars::null_terminated(name);
        let data = WasmHandlebars::null_terminated(data);

        let name_length = name.len() as u32;
        let data_length = data.len() as u32;

        let name_ptr = self.alloc(name_length);
        let data_ptr = self.alloc(data_length);

        self.write_to_buffer(name_ptr, &name.as_slice());
        self.write_to_buffer(data_ptr, &data.as_slice());

        let html_ptr = self._render(name_ptr, data_ptr);
        let html = self.read_string(html_ptr);

        self.dealloc(name_ptr, name_length);
        self.dealloc(data_ptr, data_length);
        self.dealloc(html_ptr, html.len() as u32);

        return html;
    }

    fn null_terminated(string: &str) -> Vec<u8> {
        let mut string_bytes = string.as_bytes().to_vec();
        string_bytes.push(0);
        string_bytes
    }

    fn alloc(&self, length: u32) -> U8arrayWasmPtr {
        let alloc: Func<u32, U8arrayWasmPtr> = self
            .wasm_handlebars
            .func("alloc")
            .expect("Function alloc not found");

        alloc.call(length).unwrap()
    }

    fn dealloc(&self, ptr: U8arrayWasmPtr, length: u32) {
        let dealloc: Func<(U8arrayWasmPtr, u32)> = self
            .wasm_handlebars
            .func("dealloc")
            .expect("Function dealloc not found");

        dealloc.call(ptr, length).unwrap();
    }

    fn write_to_buffer(&self, ptr: U8arrayWasmPtr, data: &[u8]) {
        let wasm_instance_context = self.wasm_handlebars.context();
        let wasm_instance_memory = wasm_instance_context.memory(0);

        let data_length = data.len() as u32;
        let memory_buffer = ptr.deref(wasm_instance_memory, 0, data_length).unwrap();

        for (i, b) in data.iter().enumerate() {
            memory_buffer[i].set(*b);
        }
    }

    fn _register_partial(&self, name_ptr: U8arrayWasmPtr, template_ptr: U8arrayWasmPtr) {
        let register_partial: Func<(U8arrayWasmPtr, U8arrayWasmPtr), ()> = self
            .wasm_handlebars
            .func("register_partial")
            .expect("Function register_partial not found");

        register_partial.call(name_ptr, template_ptr).unwrap()
    }

    fn _render(&self, name_ptr: U8arrayWasmPtr, data_ptr: U8arrayWasmPtr) -> U8arrayWasmPtr {
        let render: Func<(U8arrayWasmPtr, U8arrayWasmPtr), U8arrayWasmPtr> = self
            .wasm_handlebars
            .func("render")
            .expect("Function render not found");

        render.call(name_ptr, data_ptr).unwrap()
    }

    fn read_string(&self, ptr: U8arrayWasmPtr) -> &str {
        let wasm_instance_context = self.wasm_handlebars.context();
        let wasm_instance_memory = wasm_instance_context.memory(0);

        ptr.get_utf8_string_with_nul(&wasm_instance_memory)
            .expect("Couldn't read string")
    }
}
