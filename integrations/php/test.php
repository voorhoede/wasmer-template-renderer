<?php
require_once('WasmHandlebars.php');

$currentDirPath = dirname(__FILE__);

$blogTemplateFilePath = realpath($currentDirPath . '/../shared/blog.hbs');
$postTemplateFilePath = realpath($currentDirPath . '/../shared/post.hbs');
$jsonFilePath = realpath($currentDirPath . '/../shared/post.json');

$blogTemplate = file_get_contents($blogTemplateFilePath);
$postTemplate = file_get_contents($postTemplateFilePath);
$json = file_get_contents($jsonFilePath);

$renderer = WasmHandlebars::create();

$renderer->registerPartial('blog', $blogTemplate);
$renderer->registerPartial('post', $postTemplate);

$html = $renderer->render('blog', $json);

echo $html;
