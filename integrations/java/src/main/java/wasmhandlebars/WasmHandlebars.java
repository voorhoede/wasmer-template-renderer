package wasmhandlebars;

import org.wasmer.Instance;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;

public class WasmHandlebars {
    private Instance wasmTemplateRenderer;

    WasmHandlebars(byte[] wasmBytes) {
        this.wasmTemplateRenderer = new Instance(wasmBytes);
    }

    public static WasmHandlebars create() throws IOException {
        var currentDir = Paths.get(".").toAbsolutePath().toString();
        var wasmFilePath = Paths
                .get(currentDir + "../../../../target/wasm32-unknown-unknown/debug/wasmer_template_renderer.wasm")
                .normalize();

        var bytes = Files.readAllBytes(wasmFilePath);
        return new WasmHandlebars(bytes);
    }

    public void registerPartial(String name, String template) {
        var nameUtf8 = WasmHandlebars.nullTerminated(name);
        var templateUtf8 = WasmHandlebars.nullTerminated(template);

        var nameUtf8Length = nameUtf8.length;
        var templateUtf8Length = templateUtf8.length;

        var namePtr = this.alloc(nameUtf8Length);
        var templatePtr = this.alloc(templateUtf8Length);

        this.writeToBuffer(namePtr, nameUtf8);
        this.writeToBuffer(templatePtr, templateUtf8);

        this.registerPartial(namePtr, templatePtr);

        this.dealloc(namePtr, nameUtf8Length);
        this.dealloc(templatePtr, templateUtf8Length);
    }

    public String render(String name, String data) {
        var nameUtf8 = WasmHandlebars.nullTerminated(name);
        var dataUtf8 = WasmHandlebars.nullTerminated(data);

        var nameUtf8Length = nameUtf8.length;
        var dataUtf8Length = dataUtf8.length;

        var namePtr = this.alloc(nameUtf8Length);
        var dataPtr = this.alloc(dataUtf8Length);

        this.writeToBuffer(namePtr, nameUtf8);
        this.writeToBuffer(dataPtr, dataUtf8);

        var htmlPtr = this.render(namePtr, dataPtr);
        var html = this.readString(htmlPtr);

        this.dealloc(namePtr, nameUtf8Length);
        this.dealloc(dataPtr, dataUtf8Length);
        this.dealloc(htmlPtr, html.stringBytesLength);

        return html.string;
    }

    private Integer alloc(Integer length) {
        var alloc = this.wasmTemplateRenderer.exports.getFunction("alloc");
        return (Integer) alloc.apply(length)[0];
    }

    private void dealloc(Integer ptr, Integer length) {
        var dealloc = this.wasmTemplateRenderer.exports.getFunction("dealloc");
        dealloc.apply(ptr, length);
    }

    private static byte[] nullTerminated(String string) {
        var stringBytes = string.getBytes(StandardCharsets.UTF_8);
        var stringLength = stringBytes.length;
        var nullTerminatedString = new byte[stringLength + 1];

        for (var i = 0; i < stringLength; i++)
            nullTerminatedString[i] = stringBytes[i];

        nullTerminatedString[stringLength] = 0;

        return nullTerminatedString;
    }

    private void writeToBuffer(Integer ptr, byte[] data) {
        var memory = this.wasmTemplateRenderer.exports.getMemory("memory");
        var memoryBuffer = memory.buffer();

        memoryBuffer.position(ptr);
        memoryBuffer.put(data);
    }

    private void registerPartial(Integer namePtr, Integer templatePtr) {
        var registerPartial = this.wasmTemplateRenderer.exports.getFunction("register_partial");
        registerPartial.apply(namePtr, templatePtr);
    }

    private Integer render(Integer namePtr, Integer dataPtr) {
        var render = this.wasmTemplateRenderer.exports.getFunction("render");
        return (Integer) render.apply(namePtr, dataPtr)[0];
    }

    private DecodedString readString(Integer ptr) {
        var memory = this.wasmTemplateRenderer.exports.getMemory("memory");
        var memoryBuffer = memory.buffer();

        var stringBytes = new StringBuilder();
        var max = (Integer) memoryBuffer.limit();

        for (var i = ptr; i < max; ++i) {
            byte[] b = new byte[1];
            memoryBuffer.position(i);
            memoryBuffer.get(b);

            if (b[0] == 0) {
                break;
            }

            stringBytes.appendCodePoint(b[0]);
        }

        return new DecodedString(stringBytes.toString(), stringBytes.length());
    }
}

class DecodedString {
    public String string;
    public Integer stringBytesLength;

    DecodedString(String string, Integer stringBytesLength) {
        this.string = string;
        this.stringBytesLength = stringBytesLength;
    }
}