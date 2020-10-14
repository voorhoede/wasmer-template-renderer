package wasmhandlebars;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileWriter;
import java.io.FileReader;
import java.io.BufferedReader;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

public class Test {
    public static void main(String[] args) {
        try {
            var directoriesPath = DirectoriesPath.getInstance();

            var blogTemplateFilePath = Paths.get(DirectoriesPath.sharedDirPath + "/blog.hbs").normalize();
            var postTemplateFilePath = Paths.get(DirectoriesPath.sharedDirPath + "/post.hbs").normalize();
            var jsonFilePath = Paths.get(DirectoriesPath.sharedDirPath + "/post.json").normalize();

            var blogTemplate = Files.readString(blogTemplateFilePath);
            var postTemplate = Files.readString(postTemplateFilePath);
            var json = Files.readString(jsonFilePath);

            var renderer = WasmHandlebars.create();

            renderer.registerPartial("blog", blogTemplate);
            renderer.registerPartial("post", postTemplate);

            var html = renderer.render("blog", json);

            Test.saveFile(directoriesPath.getOutputDirPath(), "post.html", html);
        } catch (Exception e) {
            Test.saveError(e.getMessage());
        }
    }

    private static void saveFile(String path, String filename, String contents) {
        try {
            var file = new File(path, filename);
            file.getParentFile().mkdirs();
            var filePath = Paths.get(file.getPath());
            Files.write(filePath, contents.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            System.out.println(e);
        }
    }

    private static void saveError(String err) {
        try {
            var config = Config.getInstance();
            var directoriesPath = DirectoriesPath.getInstance();
            var errorFilename = Config.lang + config.getErrorExt();
            Test.saveFile(directoriesPath.getOutputDirPath(), errorFilename, err);
        } catch (Exception e) {
            System.out.println(e);
        }
    }
}

class DirectoriesPath {
    private static DirectoriesPath single_instance = null; 
    public static final String currentDirPath = Paths.get(".").toAbsolutePath().toString();
    public static final String rootDirPath = Paths.get(DirectoriesPath.currentDirPath, "../..").normalize().toString();
    public static final String sharedDirPath = Paths.get(DirectoriesPath.rootDirPath, "/integrations/shared").normalize().toString();
    private String outputDirPath;

    private static DirectoriesPath create() throws FileNotFoundException {
        var directoriesPath = new DirectoriesPath();
        var config = Config.getInstance();

        directoriesPath.outputDirPath = Paths.get(DirectoriesPath.rootDirPath, "/", config.getOutputDir(), Config.lang).toString();

        return directoriesPath;
    }

    public static DirectoriesPath getInstance() throws FileNotFoundException {
        if (DirectoriesPath.single_instance == null) 
            DirectoriesPath.single_instance = DirectoriesPath.create();
  
        return DirectoriesPath.single_instance; 
    }

    public String getOutputDirPath() {
        return this.outputDirPath;
    }
}

class Config {
    private static Config single_instance = null;
    public static final String lang = "java";
    private String outputDir; 
    private String dataExt; 
    private String errorExt; 
    private String templateExt; 

    private static Config create() throws FileNotFoundException {
        var builder = new GsonBuilder(); 
        var gson = builder.create();

        var configPath = Paths.get(DirectoriesPath.rootDirPath, "/config.json").toString();

        var bufferedReader = new BufferedReader(new FileReader(configPath));
        var config = gson.fromJson(bufferedReader, Config.class);

        return config;
    }

    public static Config getInstance() throws FileNotFoundException {
        if (Config.single_instance == null) 
            Config.single_instance = Config.create();
  
        return Config.single_instance; 
    }

    public String getOutputDir() {
        return this.outputDir;
    }

    public String getDataExt() {
        return this.dataExt;
    }

    public String getErrorExt() {
        return this.errorExt;
    }

    public String getTemplateExt() {
        return this.templateExt;
    }
}