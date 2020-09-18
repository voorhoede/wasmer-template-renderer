use std::ffi::{CStr, CString};
use std::mem;
use std::os::raw::{c_char, c_void};
use std::str;
use serde_json::{Value};
use handlebars::{Handlebars};
use std::fmt::Error;
use std::str::Utf8Error;

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

fn c_char_to_str<'a>(chars: *mut c_char) -> Result<String, Utf8Error> {
    let chars = unsafe { CStr::from_ptr(chars).to_bytes().to_vec() };
    match str::from_utf8(&chars) {
        Ok(v) => Ok(v.to_string()),
        Err(e) => Err(e),
    }
}

#[no_mangle]
pub fn render(template: *mut c_char, data: *mut c_char) -> *mut c_char {
    let template = c_char_to_str(template).unwrap();
    let data = c_char_to_str(data).unwrap();

    let json: Value;

    match serde_json::from_str(&data) {
        Ok(temp_json) => json = temp_json,
        Err(e) => panic!("Could not parse to json: {}", e),
    };

    let handlebars = Handlebars::new();
    let html;

    match handlebars.render_template(&template, &json) {
        Ok(temp_html) => html = temp_html.into_bytes(),
        Err(e) => panic!("Could not render: {}", e),
    }

    unsafe { CString::from_vec_unchecked(html )}.into_raw()
}