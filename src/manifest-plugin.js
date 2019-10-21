const path = require('path');
const md5 = require('md5');
const fs = require('fs-extra');
const os = require('os');

module.exports = class ManifestPlugin {

    constructor(out, publicPath) {
        this.out = out;
        this.publicPath = publicPath;
        this.manifest = {};
    }

    apply(compiler) {
        compiler.hooks.emit.tapAsync('ManifestPlugin', this.refreshManifest.bind(this));
        compiler.hooks.done.tapAsync('ManifestPlugin', this.write.bind(this));
    }

    refreshManifest(compiler, callback) {
        let stats = compiler.getStats().toJson();
        let assets = Object.assign({}, stats.assetsByChunkName);

        if (! Array.isArray(assets.main)) {
            assets.main = [assets.main];
        }

        this.manifest = assets.main.reduce((manifest, asset) => {
            let filePath = path.join(this.out.replace(this.publicPath, ''), asset);
            let original = filePath.replace(/\?id=\w{20}/, '');

            manifest[original] = filePath;

            return manifest;
        }, {});

        callback();
    }

    write(stats, callback) {
        if (process.argv.includes('--hot')) {
            callback();
            return;
        }

        this.applyVersioning();

        fs.ensureDirSync(this.publicPath);
        fs.writeFileSync(
            path.join(this.publicPath, 'mix-manifest.json'),
            JSON.stringify(this.manifest, null, 4) + os.EOL
        );

        callback();
    }

    applyVersioning() {
        for (let asset in this.manifest) {
            let file = fs.readFileSync(path.resolve(path.join(this.publicPath, asset)), 'utf8');
            let version = md5(file).substr(0, 20);

            this.manifest[asset] = `${asset}?id=${version}`;
        }
    }

}