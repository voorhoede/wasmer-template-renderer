package hello;

import org.wasmer.Instance;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

public class HelloGradle {
    public static void main(String[] args) throws IOException {
        var currentDir = Paths.get(".").toAbsolutePath().toString();
        var wasmFilePath = Paths.get(currentDir + "../../../../target/wasm32-unknown-unknown/debug/wasmer_template_renderer.wasm").normalize();

        byte[] bytes = Files.readAllBytes(wasmFilePath);
        Instance instance = new Instance(bytes);
    }
}