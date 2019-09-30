const fs = require('fs-extra');

module.exports = class HotFilePlugin {

    constructor(out, host, port) {
        this.out = out;
        this.host = host;
        this.port = port;
    }

    apply(compiler) {
        compiler.hooks.beforeRun.tapAsync('HotFilePlugin', (compiler, callback) => {
            if (fs.existsSync(path.join(this.out, 'hot'))) {
                fs.unlinkSync(path.join(this.out, 'hot'));
            }

            if (process.argv.includes('--hot')) {
                fs.writeFileSync(path.join(this.out, 'hot'), `http://${this.host}:${this.port}/`);
            }
        });
    }

}