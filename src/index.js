module.exports = {
    webpack: {
        dir: __dirname,

        ManifestPlugin: require('./manifest-plugin'),
        HotFilePlugin: require('./hot-file-plugin'),

        defaults: {
            mode: process.env.NODE_ENV,

            context: process.cwd(),

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

            devtool: process.env.NODE_ENV !== 'production' ? 'eval-source-map' : false
        }
    }
}