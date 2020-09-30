using System;
using WasmerSharp;
using System.IO;

namespace Example
{
    class Program
    {
        static void Main(string[] args)
        {
            try {
                var currentDir = Directory.GetCurrentDirectory();
                var wasmPath = Path.Combine(currentDir, Path.GetFullPath("../../target/wasm32-unknown-unknown/debug/wasmer_template_renderer.wasm"));

		        var memoryImport = new Import("env", "memory", Memory.Create(minPages: 256, maxPages: 256));
	
                var wasm = File.ReadAllBytes(wasmPath);
                var instance = new Instance(wasm, memoryImport);
                var instanceContext = instance.Context;

                var postTemplateFilePath = Path.Combine(currentDir, Path.GetFullPath("../shared/hbs/post.hbs"));
                var jsonFilePath = Path.Combine(currentDir, Path.GetFullPath("../shared/json/data.json"));

                var postTemplate = File.ReadAllText(postTemplateFilePath);
                var json = File.ReadAllText(jsonFilePath);

                var postTemplateLength = postTemplate.Length + 1;
                var jsonLength = json.Length + 1;

                var postTemplatePtr = instance.Call("alloc", postTemplateLength)[0];
                var jsonPtr = instance.Call("alloc", jsonLength)[0];

                Console.WriteLine(postTemplatePtr);
                Console.WriteLine(jsonPtr);
            } catch(Exception e) {
                Console.WriteLine(e);
            }
        }
    }
}
