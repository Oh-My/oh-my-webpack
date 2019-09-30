const fs = require('fs');
const path = require('path');

const type = guess_project_type();

let file = fs.readFileSync(path.resolve(__dirname, '../src/webpack.config.js'), 'utf8');

if (type === 'wordpress') {
    file = file.replace(/\$PUBLIC_PATH\$/g, "'web'")
        .replace(/\$OUT\$/g, "'web/wp-content/themes/{{cookiecutter.project_slug}}/build'")
        .replace(/\$PURGECSS\$/g, "'./web/wp-content/**/*.php'")
        .replace(/\$WATCH\$/g, "'web/wp-content/**/*.php'");
}

if (type === 'laravel') {
    file = file.replace(/\$PUBLIC_PATH\$/g, "'public'")
        .replace(/\$OUT\$/g, "'public/build'")
        .replace(/\$PURGECSS\$/g, "'./resources/views/**/**.blade.php'")
        .replace(/\$WATCH\$/g, "'resources/views/**/**.blade.php'");
}

if (type === 'other') {
    file = file.replace(/\$PUBLIC_PATH\$/g, "'web'")
        .replace(/\$OUT\$/g, "'web/build'")
        .replace(/\$PURGECSS\$/g, '// ..')
        .replace(/\$WATCH\$/g, '// ..');
}

fs.writeFileSync(path.join(process.cwd(), 'webpack.config.js'), file, 'utf8');

function guess_project_type() {
    if (fs.existsSync(path.resolve(process.cwd(), 'web/wp-config.php'))) {
        return 'wordpress';
    }

    if (fs.existsSync(path.resolve(process.cwd(), 'artisan'))) {
        return 'laravel';
    }

    return 'other';
}