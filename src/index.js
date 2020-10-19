const webpack = require('webpack');
const { merge } = require('webpack-merge');
const path = require('path');
const fs = require('fs-extra');
const chokidar = require('chokidar');
const { VueLoaderPlugin } = require('vue-loader');

const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const WebpackNotifierPlugin = require('webpack-notifier');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const ManifestPlugin = require('./manifest-plugin');
const DashboardPlugin = require('webpack-dashboard/plugin');

class WebpackConfig {

    constructor(options) {
        this.options = require('./options-validator')(options)

        this.hot = process.argv.includes('--hot');

        this.options.hmr = Object.assign({
            host: 'localhost', port: 8080
        }, this.options.hmr);

        this.options.purgeCss = Object.assign({
            enabled: true
        }, this.options.purgeCss);

        let postcssPresetEnvOptions = Object.assign({
            stage: 2
        }, this.options.postcssPresetEnv);

        let babelExclude = /node_modules/;

        if (! Array.isArray(this.options.transpileModules)) {
            this.options.transpileModules = [];
        }

        this.options.transpileModules = this.options.transpileModules.concat(['dom7', 'ssr-window', 'swiper']);

        if (this.options.transpileModules.length) {
            babelExclude = new RegExp('node_modules/(?!('+this.options.transpileModules.join('|')+')/).*');
        }

        let hotFilePath = this.options.hotFilePath || this.options.out;

        if (fs.existsSync(path.join(hotFilePath, 'hot'))) {
            fs.unlinkSync(path.join(hotFilePath, 'hot'));
        }

        if (this.hot) {
            let hotUrl = `http://${this.options.hmr.host}:${this.options.hmr.port}`;

            if (this.options.hotUrlTrailingSlash !== false) {
                hotUrl = hotUrl + '/';
            }

            fs.writeFileSync(
                path.join(hotFilePath, 'hot'),
                hotUrl
            );
        }

        let purgeCssOptions = Object.assign({
            defaultExtractor: content => content.match(/[A-Za-z0-9-_:/]+/g) || []
        }, this.options.purgeCss.options)

        return this.build({
            mode: process.env.NODE_ENV,

            context: process.cwd(),

            entry: [
                './resources/js/app.js',
                './resources/css/app.css'
            ],

            output: {
                path: this.hot ? '/' : path.resolve(process.cwd(), this.options.out),
                filename: 'app.js',
                publicPath: this.hot ? `http://${this.options.hmr.host}:${this.options.hmr.port}/` : '/'
            },

            stats: {
                hash: false,
                version: false,
                timings: false,
                children: false,
                errorDetails: false,
                entrypoints: false,
                performance: false,
                chunks: false,
                modules: false,
                reasons: false,
                source: false,
                publicPath: false,
                builtAt: false
            },

            performance: {
                hints: false
            },

            devtool: process.env.NODE_ENV !== 'production' ? 'eval-source-map' : false,

            optimization: process.env.NODE_ENV === 'production'
                ? {
                    minimizer: [
                        new TerserPlugin({
                            cache: true,
                            parallel: true,
                            sourceMap: true,
                            terserOptions: {
                                compress: {
                                    warnings: false
                                },
                                output: {
                                    comments: false
                                }
                            }
                        }),
                        new OptimizeCSSAssetsPlugin({
                            cssProcessorPluginOptions: {
                                preset: ['default', {}]
                            }
                        })
                    ]
                } : {},

            plugins: [
                new VueLoaderPlugin(),
                new ManifestPlugin(
                    this.options.out,
                    this.options.publicPath
                ),
                new MiniCssExtractPlugin({
                    filename: 'app.css'
                }),
                new FriendlyErrorsWebpackPlugin({
                    clearConsole: true
                }),
                new WebpackNotifierPlugin({
                    title: 'Oh My Webpack',
                    alwaysNotify: true,
                    hint:
                    process.platform === 'linux'
                        ? 'int:transient:1'
                        : undefined,
                    contentImage: path.join(__dirname, 'logo.png'),
                }),
                new BundleAnalyzerPlugin({
                    analyzerMode: 'disabled',
                    generateStatsFile: process.env.NODE_ENV === 'production',
                    statsFilename: 'webpack-stats.json',
                    statsOptions: { source: false }
                }),
                new DashboardPlugin()
            ],

            resolve: {
                alias: {
                    'vue$' : 'vue/dist/vue.common.js'
                },
                extensions: ['*', '.wasm', '.mjs', '.js', '.jsx', '.json', '.vue']
            },

            module: {
                rules: [
                    {
                        test: /\.js$/,
                        exclude: babelExclude,
                        use: {
                            loader: 'babel-loader',
                            options: {
                                presets: [
                                    [
                                        '@babel/preset-env',
                                        {
                                            modules: false,
                                            forceAllTransforms: true
                                        }
                                    ]
                                ],
                                plugins: [
                                    '@babel/plugin-syntax-dynamic-import',
                                    '@babel/plugin-proposal-object-rest-spread',
                                    [
                                        '@babel/plugin-transform-runtime',
                                        {
                                            helpers: false
                                        }
                                    ]
                                ]
                            }
                        }
                    },
                    {
                        test: /\.vue$/,
                        use: [
                            {
                                loader: 'vue-loader',
                                options: {}
                            }
                        ]
                    },
                    {
                        test: /\.css$/,
                        exclude: /node_modules/,
                        use: [
                            {
                                loader: MiniCssExtractPlugin.loader, options: {
                                    hmr: process.env.NODE_ENV === 'development'
                                }
                            },
                            {
                                loader: 'css-loader', options: {
                                    importLoaders: 1,
                                    sourceMap: process.env.NODE_ENV !== 'production',
                                    url: false
                                }
                            },
                            {
                                loader: 'postcss-loader', options: {
                                    sourceMap: process.env.NODE_ENV !== 'production',
                                    ident: 'postcss',
                                    plugins: [
                                        require('postcss-import'),
                                        require('tailwindcss'),
                                        require('postcss-preset-env')(postcssPresetEnvOptions),
                                        require('postcss-nested'),
                                        require('postcss-mixins'),
                                        require('postcss-simple-vars'),
                                        ...this.options.purgeCss.enabled
                                            ? [require('@fullhuman/postcss-purgecss')(purgeCssOptions)]
                                            : [],
                                    ]
                                }
                            }
                        ]
                    }
                ]
            },

            devServer: {
                before: (app, server) => {
                    chokidar.watch(this.options.watch).on('all', _ => {
                        server.sockWrite(server.sockets, 'content-changed');
                    });
                },
                host: this.options.hmr.host,
                port: this.options.hmr.port,
                headers: {
                    'Access-Control-Allow-Origin': '*'
                },
                disableHostCheck: true,
                contentBase: this.options.hmr.contentBase || path.resolve(this.options.out, '../'),
                ...this.options.hmr.publicPath
                    ? {publicPath: this.options.hmr.publicPath}
                    : {},
                historyApiFallback: true,
                noInfo: true,
                compress: true,
                quiet: true
            }

        });
    }

    build(config) {
        return typeof this.options.extend === 'function'
            ? merge(config, this.options.extend(config, webpack))
            : config;
    }
}

module.exports = WebpackConfig;
