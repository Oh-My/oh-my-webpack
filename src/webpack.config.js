
const path = require('path')
const fs = require('fs-extra')
const chokidar = require('chokidar')

const { VueLoaderPlugin } = require('vue-loader')
const TerserPlugin = require('terser-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
const WebpackNotifierPlugin = require('webpack-notifier')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const DashboardPlugin = require('webpack-dashboard/plugin')

const { ManifestPlugin } = require('@ohmy/webpack')
const options = require('./ohmy.webpack')

const isHot = process.argv.includes('--hot')

module.exports = {
    mode: process.env.NODE_ENV,

    context: process.cwd(),

    entry: [
        './resources/js/app.js',
        './resources/css/app.css'
    ],

    output: {
        path: isHot ? '/' : path.resolve(process.cwd(), options.out),
        filename: 'app.js',
        publicPath: isHot ? `http://${options.hmr.host}:${options.hmr.port}/` : '/'
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
            options.out,
            options.publicPath
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
            contentImage: require.resolve('@ohmy/webpack/src/logo.png'),
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
                exclude: new RegExp('node_modules/(?!(dom7|ssr-window|swiper)/).*'),
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
                                require('postcss-preset-env')({ stage: 2 }),
                                require('postcss-nested'),
                                require('postcss-mixins'),
                                require('postcss-simple-vars'),
                                ...process.env.NODE_ENV === 'production'
                                    ? [require('@fullhuman/postcss-purgecss')(options.purgeCssOptions)]
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
            chokidar.watch(options.watch).on('all', _ => {
                server.sockWrite(server.sockets, 'content-changed')
            })
        },
        host: options.hmr.host,
        port: options.hmr.port,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        disableHostCheck: true,
        contentBase: options.hmr.contentBase || path.resolve(options.out, '../'),
        ...options.hmr.publicPath
            ? {publicPath: options.hmr.publicPath}
            : {},
        historyApiFallback: true,
        noInfo: true,
        compress: true,
        quiet: true
    }
}

let hotFilePath = options.hotFilePath || options.out

if (fs.existsSync(path.join(hotFilePath, 'hot'))) {
    fs.unlinkSync(path.join(hotFilePath, 'hot'))
}

if (this.hot) {
    let hotUrl = `http://${options.hmr.host}:${options.hmr.port}`

    if (options.hotUrlTrailingSlash !== false) {
        hotUrl = hotUrl + '/'
    }

    fs.writeFileSync(
        path.join(hotFilePath, 'hot'),
        hotUrl
    )
}
