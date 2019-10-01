const path = require('path');
const chokidar = require('chokidar');
const ohmy = require('@ohmy/webpack');

const { VueLoaderPlugin } = require('vue-loader');
const TerserPlugin = require('terser-webpack-plugin');
const WebpackNotifierPlugin = require('webpack-notifier');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');

const config = {
    out: $OUT$,
    publicPath: $PUBLIC_PATH$,
    watch: [
        $WATCH$
    ],
    hmrHost: 'localhost',
    hmrPort: 8080
}

module.exports = {
    ... ohmy.webpack.defaults,

    entry: [
        './resources/js/app.js',
        './resources/css/app.css'
    ],

    output: {
        path: process.argv.includes('--hot') ? '/' : path.resolve(process.cwd(), config.out),
        filename: 'app.js',
        publicPath: process.argv.includes('--hot') ? `http://${config.hmrHost}:${config.hmrPort}/` : '/'
    },

    resolve: {
        alias: { 'vue$' : 'vue/dist/vue.common.js' },
        extensions: ['*', '.wasm', '.mjs', '.js', '.jsx', '.json', '.vue']
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules\/(?!(dom7|ssr-window|swiper|)\/).*/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['@babel/preset-env', {
                                modules: false,
                                forceAllTransforms: true
                            }]
                        ],
                        plugins: [
                            '@babel/plugin-syntax-dynamic-import',
                            '@babel/plugin-proposal-object-rest-spread',
                            ['@babel/plugin-transform-runtime', {
                                helpers: false
                            }]
                        ]
                    }
                }
            },

            {
                test: /\.vue$/,
                use: [{ loader: 'vue-loader', options: {} }]
            },

            {
                test: /\.css$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: { hmr: process.env.NODE_ENV === 'development' }
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1,
                            sourceMap: process.env.NODE_ENV !== 'production',
                            url: false
                        }
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            sourceMap: process.env.NODE_ENV !== 'production',
                            ident: 'postcss',
                            plugins: [
                                require('postcss-import'),
                                require('tailwindcss'),
                                require('autoprefixer')({ enabled: true }),
                                require('postcss-mixins'),
                                require('postcss-nested'),
                                require('postcss-simple-vars'),
                                require('postcss-hexrgba'),
                                require('@fullhuman/postcss-purgecss')({
                                    defaultExtractor: content => content.match(/[A-Za-z0-9-_:/]+/g) || [],
                                    whitelist: [
                                        $PURGECSS_WHITELIST$
                                    ],
                                    content: [
                                        "./resources/js/**/*.vue",
                                        $PURGECSS_CONTENT$
                                    ]
                                })
                            ]
                        }
                    }
                ]
            }
        ]
    },

    devServer: {
        before: (_, server) => {
            chokidar.watch(config.watch).on('all', _ => {
                server.sockWrite(server.sockets, 'content-changed');
            });
        },
        host: config.hmrHost,
        port: config.hmrPort,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        disableHostCheck: true,
        contentBase: path.resolve(config.out, '../'),
        historyApiFallback: true,
        noInfo: true,
        compress: true,
        quiet: true
    },

    plugins: [
        new VueLoaderPlugin(),
        new ohmy.webpack.HotFilePlugin(config.out, config.hmrHost, config.hmrPort),
        new ohmy.webpack.ManifestPlugin(config.out, config.publicPath),
        new MiniCssExtractPlugin({ filename: 'app.css' }),
        new FriendlyErrorsWebpackPlugin({ clearConsole: true }),
        new WebpackNotifierPlugin({
            title: 'Oh My Webpack',
            alwaysNotify: true,
            hint:
            process.platform === 'linux'
                ? 'int:transient:1'
                : undefined,
            contentImage: path.join(ohmy.webpack.dir, 'logo.png'),
        })
    ],

    optimization: process.env.NODE_ENV !== 'production' ? {} : {
        minimizer: [
            new TerserPlugin({
                cache: true,
                parallel: true,
                sourceMap: true,
                terserOptions: {
                    compress: { warnings: false },
                    output: { comments: false }
                }
            }),
            new OptimizeCSSAssetsPlugin({
                cssProcessorPluginOptions: {
                    preset: ['default', {}]
                }
            })
        ]
    }
}