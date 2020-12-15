const Schema = require('validate');
const chalk = require('chalk');

module.exports = function(options) {
    let schema = new Schema({
        publicPath: { type: String, required: true },
        out: { type: String, required: true },
        watch: { type: Array, required: true, each: { type: String, message: 'watch should contain an array of string paths.' } },
        purgeCss: {
            enabled: { type: Boolean, required: false },
            options: { type: Object, required: false }
        },
        postcssPresetEnv: {
            stage: { type: Number, required: false },
            options: { type: Object, required: false }
        },
        hmr: {
            host: { type: String, required: false },
            port: { type: Number, required: false },
            contentBase: { type: String, required: false },
            publicPath: { type: String, required: false }
        },
        extend: { type: Function, required: false },
        transpileModules: { type: Array, required: false },
        hotFilePath: { type: String, required: false },
        customTailwind: { required: false }
    });

    let errors = schema.validate(options, {strip: false});

    if (errors.length) {
        console.log(
            chalk.white.bgBlack('Oh My Webpack')
            + ' '
            + chalk.red.bgBlack('Error!')
            + '\n\n'
            + 'Invalid options passed to WebpackConfig:'
        );

        errors.forEach(error => {
            console.log(chalk.red('- options.'+error.message));
        });

        console.log('\n');

        process.exit(0);
    }

    return options;
}
