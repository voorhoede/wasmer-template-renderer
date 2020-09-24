const HtmlWebPackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

const wasmFilePath = path.resolve(__dirname, '../../target/wasm32-unknown-unknown/debug/wasmer_template_renderer.wasm');
const indexFilePath = path.resolve(__dirname, 'web/index.html')

module.exports = {
    context: __dirname,
    entry: './web/example.js',
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: wasmFilePath,
                    to: 'public'
                }
            ]
        }),
        new HtmlWebPackPlugin({
            template: indexFilePath
        })
    ]
};