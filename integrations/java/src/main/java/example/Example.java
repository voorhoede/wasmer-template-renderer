import org.wasmer.Instance;

import java.nio.charset.StandardCharsets;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

public class Example {
    public static void main(String[] args) throws IOException {
        var currentDir = Paths.get(".").toAbsolutePath().toString();
        var wasmFilePath = Paths.get(currentDir + "../../../../target/wasm32-unknown-unknown/debug/wasmer_template_renderer.wasm").normalize();

        var bytes = Files.readAllBytes(wasmFilePath);
        var instance = new Instance(bytes);
        var memory = instance.exports.getMemory("memory");

        var postTemplateFilePath = Paths.get(currentDir + "../../../shared/hbs/post.hbs").normalize();
        var jsonFilePath = Paths.get(currentDir + "../../../shared/json/data.json").normalize();

        var postTemplate = Files.readString(postTemplateFilePath);
        var json = Files.readString(jsonFilePath);

        var postTemplateLength = postTemplate.length() + 1;
        var jsonLength = json.length() + 1;

        var alloc = instance.exports.getFunction("alloc");
        
        var postTemplatePtr = (Integer) alloc.apply(postTemplateLength)[0];
        var jsonPtr = (Integer) alloc.apply(jsonLength)[0];

        {
            var memoryBuffer = memory.buffer();
            memoryBuffer.position(postTemplatePtr);
            memoryBuffer.put(postTemplate.getBytes(StandardCharsets.UTF_8));
    
            memoryBuffer.position(jsonPtr);
            memoryBuffer.put(json.getBytes(StandardCharsets.UTF_8));
        }

        var render = instance.exports.getFunction("render");
        
        var htmlPtr = (Integer) render.apply(postTemplatePtr, jsonPtr)[0];

        String html;

        {
            var output = new StringBuilder();
            var memoryBuffer = memory.buffer();
            var max = (Integer) memoryBuffer.limit();

            for (var i = htmlPtr; i < max; ++i) {
                byte[] b = new byte[1];
                memoryBuffer.position(i);
                memoryBuffer.get(b);

                if (b[0] == 0) {
                    break;
                }

                output.appendCodePoint(b[0]);
            }

            html = output.toString();
        }
        
        System.out.println(html);

        instance.close();
    }
}