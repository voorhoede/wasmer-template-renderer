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
            Test.saveFile(directoriesPath.outputDirPath, "post.html", html);
        } catch (Exception e) {
            System.out.println(e);
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
            var errorFilename = Config.LANG + config.errorExt;
            Test.saveFile(directoriesPath.outputDirPath, errorFilename, err);
        } catch (Exception e) {
            System.out.println(e);
        }
    }
}

class DirectoriesPath {
    private static DirectoriesPath instance = null; 
    public static final String currentDirPath = Paths.get(".").toAbsolutePath().toString();
    public static final String rootDirPath = Paths.get(DirectoriesPath.currentDirPath, "../..").normalize().toString();
    public static final String sharedDirPath = Paths.get(DirectoriesPath.rootDirPath, "/integrations/shared").normalize().toString();
    public String outputDirPath;

    private DirectoriesPath() {}

    private static DirectoriesPath create() throws FileNotFoundException {
        var directoriesPath = new DirectoriesPath();
        var config = Config.getInstance();

        directoriesPath.outputDirPath = Paths.get(DirectoriesPath.rootDirPath, "/", config.outputDir, Config.LANG).toString();

        return directoriesPath;
    }

    public static DirectoriesPath getInstance() throws FileNotFoundException {
        if (DirectoriesPath.instance == null) 
            DirectoriesPath.instance = DirectoriesPath.create();
  
        return DirectoriesPath.instance; 
    }
}

class Config {
    private static Config instance = null;
    public static final String LANG = "java";
    public String outputDir; 
    public String dataExt; 
    public String errorExt; 
    public String templateExt; 

    private Config() {}

    private static Config create() throws FileNotFoundException {
        var builder = new GsonBuilder(); 
        var gson = builder.create();

        var configPath = Paths.get(DirectoriesPath.rootDirPath, "/config.json").toString();

        var bufferedReader = new BufferedReader(new FileReader(configPath));
        var config = gson.fromJson(bufferedReader, Config.class);

        return config;
    }

    public static Config getInstance() throws FileNotFoundException {
        if (Config.instance == null) 
            Config.instance = Config.create();
  
        return Config.instance; 
    }
}