## Introduction

**Oh My Webpack** is (finally :tada:) the new build setup for all our frontend needs and purposes.
There's not really anything else to say about it. If you have problems or questions, please pm **eriksson**, **antejohansson** or **viktor** on **Slack**. Any suggestions are welcome. And everyone is welcome to contribute to this repository, but please at least mention your planned change in **#frontendarklubben** so that we may discuss the changes.

## Features
So basically what we have here is some bundling with webpack. The setup comes with Tailwind for CSS, Vue/Axios/Lodash for JS, which is not entirely necessary for small projects but anything remotely complicated should be made with this trio, and a bunch of QoL-stuff like CSS-purging and autoformatting.

### PostCSS
Yeah, you heard it right. No more SCSS and crying terminals when trying to resolve missing `node-sass` bindings during `npm install`. We've included some neat PostCSS plugins though, which should essentially make the transition seamless.

Oh, and by the way! You can add additional PostCSS plugins to your build if you want to do some crazy shit. See the `extend` option documented in the options section below.

### Tailwind (https://tailwindcss.com/docs)
In your project root you will find a file called tailwind.config.js.
In there are a few examples on how you can extend the base config to fit your projects every need. This can be compared to setting up variables in SCSS.

#### - "Uhm, I want to write my own CSS.."
Sure, go ahead and remove the pre-included `@tailwind` directives in your `app.css`. However, you may want to keep `@tailwind base` which is essentialy `normalize.css`.

### Vue.js (https://vuejs.org/v2/guide/)
For anything other than simple add/remove classes and sending ajax requests for forms, we should be using **Vue** as our framework.

#### If Vue is not for You
You might not be needing **Vue**, and that's fine. Just remove all things **Vue** in your `app.js`.

#### Other frameworks
Don't count on the base webpack configuration to handle compilation of components for you. You can add the necessary loaders and stuff to the webpack configuration by using the `extend` option documented in the options section below.

### Compatible with the Laravel Mix helper
The build process generates a `mix-manifest.json` which means you may use the [`mix()`](https://laravel.com/docs/5.8/helpers#method-mix) helper just like normal to resolve asset urls in Laravel projects. It's actually also compatible with the automatic replacement of the asset urls when hot module replacement is enabled.

To further take advantage of this fact, we've included the same mix helper in
the WordPress boilerplate for you as well.

### 🎉 Fun stuffs 🎉
add ```webpack-dashboard -- ``` infront of ```webpack-dev-server``` in your npm-script
to get a more [`fun output`](https://github.com/FormidableLabs/webpack-dashboard).

## Configuration example

```javascript
const WebpackConfig = require('oh-my-webpack');

module.exports = new WebpackConfig({
    publicPath: 'web',
    out: 'web/wp-content/themes/example-theme/build',
    watch: [
        "web/wp-content/**/*.php"
    ],
    purgeCss: {
        // Enables purgeCss for production only (recommended)
        enabled: process.env.NODE_ENV === 'production',
        options: {
            content: [
                "./resources/js/**/*.js",
                "./resources/js/**/*.vue",
                "./web/wp-content/**/*.php"
            ]
        }
    },
    postcssPresetEnv: {
        stage: 1
    },
    hmr: {
        host: 'localhost',
        port: 8080
    },
    extend: (config, webpack) => {
        // Provide any additional webpack configuration options here
    }
});
```

## Options
Our project boilerplates are already setup and ready to go, but sometimes you may want to do things a bit differently. The following options are available for you to dictate how webpack will compile your assets:

|Name|Type|Required|Description|
|-|--|-|-|
|**`publicPath`**|`{String}`|`true`|Path to the public root directory served by your application, relative to the project root.|
|**`out`**|`{String}`|`true`|Path to the build directory in which compiled assets are placed, relative to the project root.|
|**`watch`**|`{Array.<string>}`|`true`|Additional files to be watched for changes, relative to the project root. Paths may include glob `*` patterns.|
|**`purgeCss.enabled`**|`{Boolean}`|`false`|Whether [Purgecss](https://www.purgecss.com) should be used to remove unused classes. Default: `true`|
|**`purgeCss.options`**|`{Object}`|`false`|An options object to pass to [Purgecss](https://www.purgecss.com). See the [documentation](https://www.purgecss.com/with-postcss) for available options.|
|**`hmr.host`**|`{String}`|`false`|The address that webpack dev server will bind to for hot module replacement. Default: `localhost`|
|**`hmr.port`**|`{Number}`|`false`|The port that webpack dev server will bind to for hot module replacement. Default: `8080`|
|**`extend`**|`{Function}`|`false`|Extend or override the underlying webpack configuration. This callback function should return an object which will be deep merged with the current configuration. The callback receives two arguments: the current configuration `config` and `webpack`. |
|**`transpileModules`**|`{Array.<string>}`|`false`|An array of node module names that should be included in the babel transpilation. This is useful if for example you import a third party module that uses ES6 syntax. Default: `dom7, ssr-window, swiper` |
|**`postcssPresetEnv.stage`**|`{Number}`|`false`|Refers to which css-features to plolyfill. 2 is default. See the[documentation] (https://github.com/csstools/postcss-preset-env#stage) |
|**`postcssPresetEnv.options`**|`{Object}`|`false`|Options to pass to the postcss-preset-env-module. Useful if you want to combine certain features with stages, See the[documentation] (https://github.com/csstools/postcss-preset-env#features) |

## Commands
The following commands are predefined for you in `package.json` to make your life a little easier:

|Command|Description|
|---|---|
|**`npm run dev`**|Compiles your assets for development.|
|**`npm run watch`**|Compiles your assets for development and recompiles whenever files are changed.|
|**`npm run hot`**|Like the above, but with hot module replacement enabled.|
|**`npm run build`**|Compiles your assets for production.|

## Frequently Asked Questions

- [I deployed my project and now a bunch of CSS classes are missing](#i-deployed-my-project-and-now-a-bunch-of-css-classes-are-missing)
- [CSS background images and web fonts are giving me 404's](#css-background-images-and-web-fonts-are-giving-me-404s)

### I deployed my project and now a bunch of CSS classes are missing
This is most certainly due to [Purgecss](https://www.purgecss.com/) treating them as unused classes, therefore removing them from the build result. To get around this you will either have to [whitelist](https://www.purgecss.com/whitelisting) the missing CSS classes or add additional watch paths to **`purgeCss`**  ([see the options section above](#options)). Note that purgeCss is usually only enabled when compiling using the **`npm run build`** command. Therefore it could be wise to run the command locally before you deploy to make sure your classes stays intact.

### CSS background images and web fonts are giving me 404's
The **`url()`** declarations in your stylesheets should be relative to the location of your compiled CSS file. So if for example your compiled CSS is stored and served from:

`web/wp-content/themes/whatever/build`

and you store your web fonts in:

`web/wp-content/themes/whatever/fonts`

then the correct url for your web fonts would be:

`../fonts/MyWebFont.woff`

## What's in the box?
- [`style-loader`](https://www.npmjs.com/package/style-loader)
- [`css-loader`](https://www.npmjs.com/package/css-loader)
- [`postcss-loader`](https://www.npmjs.com/package/postcss-loader)
- [`babel-loader`](https://www.npmjs.com/package/babel-loader)
- [`vue-loader`](https://www.npmjs.com/package/vue-loader)
- [`vue-template-compiler`](https://www.npmjs.com/package/vue-template-compiler)
- [`@babel/core`](https://www.npmjs.com/package/@babel/core)
- [`@babel/preset-env`](https://www.npmjs.com/package/@babel/preset-env)
- [`@babel/plugin-proposal-object-rest-spread`](https://www.npmjs.com/package/@babel/plugin-proposal-object-rest-spread)
- [`@babel/plugin-syntax-dynamic-import`](https://www.npmjs.com/package/@babel/plugin-syntax-dynamic-import)
- [`@babel/plugin-transform-runtime`](https://www.npmjs.com/package/@babel/plugin-transform-runtime)
- [`postcss-nested`](https://www.npmjs.com/package/postcss-nested)
- [`postcss-import`](https://www.npmjs.com/package/postcss-import)
- [`postcss-mixins`](https://www.npmjs.com/package/postcss-mixins)
- [`postcss-hexrgba`](https://www.npmjs.com/package/postcss-hexrgba)
- [`postcss-simple-vars`](https://github.com/postcss/postcss-simple-vars)
- [`postcss-preset-env`](https://github.com/csstools/postcss-preset-env)
- [`autoprefixer`](https://www.npmjs.com/package/autoprefixer)
- [`@fullhuman/postcss-purgecss`](https://www.npmjs.com/package/@fullhuman/postcss-purgecss)
- [`terser-webpack-plugin`](https://www.npmjs.com/package/terser-webpack-plugin)
- [`optimize-css-assets-webpack-plugin`](https://www.npmjs.com/package/optimize-css-assets-webpack-plugin)
- [`webpack-bundle-analyzer`](https://github.com/webpack-contrib/webpack-bundle-analyzer)
- [`webpack-dashboard`](https://github.com/FormidableLabs/webpack-dashboard)

## Conclusion
That's it. This project is forever changing and will hopefully be easily maintained (at least compared to the old Gulp boilerplate) by all of us.

Kramis // Ante & Johan