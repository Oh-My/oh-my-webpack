const fs = require('fs')
const path = require('path')

const cwd = process.env.INIT_CWD

if (fs.existsSync(path.join(cwd, 'webpack.config.js'))) {
    fs.renameSync(path.join(cwd, 'webpack.config.js'), path.join(cwd, 'webpack.config.old.js'))
    console.log('A webpack.config.js already exists in '+cwd+', renaming it to webpack.config.old.js')
}

let file = fs.readFileSync(path.resolve(__dirname, '../src/webpack.config.js'), 'utf8')

fs.writeFileSync(path.join(cwd, 'webpack.config.js'), file, 'utf8')

console.log('Copied webpack.config.js to '+cwd)
