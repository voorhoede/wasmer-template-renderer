<?php
require_once('WasmHandlebars.php');

$currentDirPath = dirname(__FILE__);

$blogTemplateFilePath = realpath($currentDirPath . '/../shared/blog.hbs');
$postTemplateFilePath = realpath($currentDirPath . '/../shared/post.hbs');
$jsonFilePath = realpath($currentDirPath . '/../shared/post.json');

$blogTemplate = file_get_contents($blogTemplateFilePath);
$postTemplate = file_get_contents($postTemplateFilePath);
$json = file_get_contents($jsonFilePath);

$instance = WasmHandlebars::create();

$instance->registerPartial('blog', $blogTemplate);
$instance->registerPartial('post', $postTemplate);

$html = $instance->render('blog', $json);

echo $html;
