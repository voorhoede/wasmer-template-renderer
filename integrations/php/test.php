<?php

declare(strict_types=1);

require_once('WasmHandlebars.php');

$LANG = 'php';
$currentDirPath = dirname(__FILE__);
$rootDirPath = realpath($currentDirPath . '/../..');
$sharedDirPath = realpath($currentDirPath . '/../shared');
$configFilePath = realpath($rootDirPath . '/config.json');
$config = json_decode(file_get_contents($configFilePath));
$outputDirPath = $rootDirPath . '/' . $config->outputDir . $LANG;

function saveFile(string $path, string $fileName, string $contents)
{
    try {
        if (!is_dir($path)) {
            mkdir($path, 0777, true);
        }

        file_put_contents($path . '/' . $fileName, $contents);
    } catch (Exception $err) {
        var_dump($err);
    }
}

function saveError(string $err)
{
    global $LANG;
    global $config;
    global $outputDirPath;

    $filename = $LANG . $config->errorExt;
    saveFile($outputDirPath, $filename, $err);
}

function run(): void
{
    global $sharedDirPath;
    global $outputDirPath;

    try {
        $blogTemplateFilePath = realpath($sharedDirPath . '/blog.hbs');
        $postTemplateFilePath = realpath($sharedDirPath . '/post.hbs');
        $jsonFilePath = realpath($sharedDirPath . '/post.json');

        $blogTemplate = file_get_contents($blogTemplateFilePath);
        $postTemplate = file_get_contents($postTemplateFilePath);
        $json = file_get_contents($jsonFilePath);

        $renderer = WasmHandlebars::create();

        $renderer->registerPartial('blog', $blogTemplate);
        $renderer->registerPartial('post', $postTemplate);

        $html = $renderer->render('blog', $json);

        saveFile($outputDirPath, 'post.html', $html);
    } catch (Exception $err) {
        var_dump($err);
        saveError($err->getMessage());
    }
}

run();
