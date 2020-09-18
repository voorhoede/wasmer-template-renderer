use std::ffi::{CStr, CString};
use std::mem;
use std::os::raw::{c_char, c_void};
use std::str;
use serde_json::{Value};
use handlebars::{Handlebars};
use std::fs::read;

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
        let _ = Vec::from_raw_parts(pointer, 0, capacity);
    }
}

#[no_mangle]
pub fn render(template: *mut c_char, data: *mut c_char) -> *mut c_char {
    let template = unsafe { CStr::from_ptr(template).to_bytes().to_vec() };
    let template = match str::from_utf8(&template) {
        Ok(v) => v,
        Err(e) => panic!("Invalid UTF-8 sequence: {}", e),
    };

    let data = unsafe { CStr::from_ptr(data).to_bytes().to_vec() };
    let data = match str::from_utf8(&data) {
        Ok(v) => v,
        Err(e) => panic!("Invalid UTF-8 sequence: {}", e),
    };

    let json: Value;

    match serde_json::from_str(data) {
        Ok(temp_json) => json = temp_json,
        Err(e) => panic!("Could not parse to json: {}", e),
    };

    let handlebars = Handlebars::new();
    let html;

    match handlebars.render_template(template, &json) {
        Ok(temp_html) => html = temp_html.into_bytes(),
        Err(e) => panic!("Could not render: {}", e),
    }

    unsafe { CString::from_vec_unchecked(html )}.into_raw()
}