package wasmhandlebars;

import java.nio.file.Files;
import java.nio.file.Paths;

public class Test {
    public static void main(String[] args) {
        try {
            var currentDir = Paths.get(".").toAbsolutePath().toString();

            var blogTemplateFilePath = Paths.get(currentDir + "../../../shared/blog.hbs").normalize();
            var postTemplateFilePath = Paths.get(currentDir + "../../../shared/post.hbs").normalize();
            var jsonFilePath = Paths.get(currentDir + "../../../shared/post.json").normalize();

            var blogTemplate = Files.readString(blogTemplateFilePath);
            var postTemplate = Files.readString(postTemplateFilePath);
            var json = Files.readString(jsonFilePath);

            var renderer = WasmHandlebars.create();

            renderer.registerPartial("blog", blogTemplate);
            renderer.registerPartial("post", postTemplate);

            var html = renderer.render("blog", json);

            System.out.println(html);
        } catch (Exception e) {
            System.out.println(e);
        }
    }
}