const fs = require('fs');
const path = require('path');

const cwd = process.env.INIT_CWD;

const type = guess_project_type();

let file = fs.readFileSync(path.resolve(__dirname, '../src/webpack.config.js'), 'utf8');

const defaults = {
    wordpress: {
        PUBLIC_PATH: 'web',
        OUT: 'web/wp-content/themes/{{cookiecutter.project_slug}}/build',
        PURGECSS: './web/wp-content/**/*.php',
        WATCH: 'web/wp-content/**/*.php'
    },
    laravel: {
        PUBLIC_PATH: 'public',
        OUT: 'public/build',
        PURGECSS: './resources/views/**/**.blade.php',
        WATCH: 'resources/views/**/**.blade.php'
    },
    other: {
        PUBLIC_PATH: 'web',
        OUT: 'web/build',
        PURGECSS: null,
        WATCH: null
    }
}

Object.entries(defaults[type]).forEach(([key, value]) => {
    file = value === null
        ? file.replace(new RegExp('\\$'+key+'\\$', 'g'), "// ..")
        : file.replace(new RegExp('\\$'+key+'\\$'), "'"+value+"'");
});

fs.writeFileSync(path.join(cwd, 'webpack.config.js'), file, 'utf8');
console.log('Copied webpack.config.js to '+cwd);

function guess_project_type() {
    if (fs.existsSync(path.resolve(cwd, 'web/wp-config.php'))) {
        return 'wordpress';
    }

    if (fs.existsSync(path.resolve(cwd, 'artisan'))) {
        return 'laravel';
    }

    return 'other';
}