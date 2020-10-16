mod renderer;

use std::ffi::{CStr, CString};
use std::mem;
use std::os::raw::{c_char, c_void};
use std::str;
use std::str::Utf8Error;

use lazy_static::lazy_static;
use mut_static::MutStatic;
use renderer::HandlebarsRenderer;

lazy_static! {
    static ref RENDERER: MutStatic<HandlebarsRenderer<'static>> =
        MutStatic::from(HandlebarsRenderer::new());
}

#[no_mangle]
pub fn alloc(size: usize) -> *mut c_void {
    let mut buffer = Vec::with_capacity(size);
    let pointer = buffer.as_mut_ptr();
    mem::forget(buffer);

    pointer as *mut c_void
}

#[no_mangle]
pub fn dealloc(pointer: *mut c_void, capacity: usize) {
    unsafe {
        Vec::from_raw_parts(pointer, 0, capacity);
    }
}

fn c_char_to_str(chars: *mut c_char) -> Result<String, Utf8Error> {
    let chars = unsafe { CStr::from_ptr(chars).to_bytes().to_vec() };
    let string = str::from_utf8(&chars)?;
    Ok(string.into())
}

#[no_mangle]
pub fn register_partial(name: *mut c_char, template: *mut c_char) {
    let name = c_char_to_str(name).unwrap();
    let template = c_char_to_str(template).unwrap();

    let mut renderer = RENDERER.write().unwrap();
    renderer.register_partial(&name, &template).unwrap();
}

#[no_mangle]
pub fn render(name: *mut c_char, data: *mut c_char) -> *mut c_char {
    let name = c_char_to_str(name).unwrap();
    let data = c_char_to_str(data).unwrap();

    let renderer = RENDERER.read().unwrap();
    let html = renderer.render(&name, &data).unwrap();

    unsafe { CString::from_vec_unchecked(html.into_bytes()) }.into_raw()
}
