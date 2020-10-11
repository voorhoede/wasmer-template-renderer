use handlebars::Handlebars;
use std::error::Error;
use serde_json::Value;
pub struct HandlebarsRenderer <'a> {
    handlebars_registry: Handlebars<'a>
}

impl<'a> HandlebarsRenderer<'a> {
    pub fn new() -> Self {
        HandlebarsRenderer {
            handlebars_registry: Handlebars::new()
        }
    }

    pub fn register_partial(&mut self, name: &str, template: &str) -> Result<(), Box<dyn Error>> {
        self.handlebars_registry.register_template_string(name, template)?;
        Ok(())
    }

    pub fn render(&self, name: &str, data: &str) -> Result<String, Box<dyn Error>>  {
        let json: Value = serde_json::from_str(data)?;
        let html = self.handlebars_registry.render(name, &json)?;
        Ok(html)
    }
}