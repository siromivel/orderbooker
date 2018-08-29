const path = require('path');

module.exports = {
    entry: [path.resolve(__dirname, "browser/index.tsx")],
    output: {
        filename: "[name].bundle.js",
        path: path.resolve(__dirname, 'dist'),
    },
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                loader: "awesome-typescript-loader"
            },
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json']
    }
};
