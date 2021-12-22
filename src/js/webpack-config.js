const webpack = require("webpack");
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const MODE_DEV = "development";
const MODE_PROD = "production";

const METHOD_REQUIRE_DEFAULTS = "addUnUsedDefault";

const DEFAULT_PLUGINS = "plugin";
const DEFAULT_IGNORE_WATCH = "ignoreWatch";
const DEFAULT_ENTRY = "entry";
const DEFAULT_PATH_ALIAS = "pathAlias";
const DEFAULT_RULES = "defaultRules";
const DEFAULT_FALLBACKS = "defaultFallbacks";
const DEFAULT_SASS_RULE = "sassRule";
const DEFAULT_LESS_RULE = "lessRule";
const DEFAULT_JS_RULE = "jsRule";
const DEFAULT_FILE_URL_RULE = "fileUrlRule";

let
    config = {
        stats : {
            errorDetails : false,
        },
    },
    defaults = {},
    dev = process.env.NODE_ENV === "dev",
    defaultCssLoader = undefined
;


class WebpackConfig {

    constructor() {

    }

    /**
     * Renvoie les loaders par défaut pour les Scripts CSS
     * @return {[*, {loader: string, options: {importLoaders: number, url: boolean}}, {loader: string}, {loader: string, options: {postcssOptions: {plugins: [[string, {}]]}}}]|any}
     */
    getDefaultCssLoader() {
        if( !defaultCssLoader ) {
            defaultCssLoader = [
                MiniCssExtractPlugin.loader,
                {
                    loader: "css-loader",
                    options: {
                        importLoaders: 1,
                        url: true,
                    },
                },
                {
                    loader: "resolve-url-loader",
                },
                {
                    loader: "postcss-loader",
                    options: {
                        postcssOptions: {
                            plugins: [
                                [
                                    "autoprefixer",
                                    {

                                    },
                                ],
                            ],
                        },
                    }
                }
            ];
        }
        return defaultCssLoader;
    }

    /**
     * Ajoute les élément qui n'ont pas été définit
     * @return {WebpackConfig}
     */
    addUnUsedDefault() {
        if(!this.hasDefault(DEFAULT_PLUGINS)) this.setDefaultPlugin();
        if(!this.hasDefault(DEFAULT_IGNORE_WATCH)) this.setDefaultIgnoreWatch();
        if(!this.hasDefault(DEFAULT_ENTRY)) this.setDefaultEntry();
        if(!this.hasDefault(DEFAULT_PATH_ALIAS)) this.addDefaultAlias();
        if(!this.hasDefault(DEFAULT_RULES)) this.setDefaultRules();
        if(!this.hasDefault(DEFAULT_FALLBACKS)) this.setDefaultFallbacks();
        if(!this.hasDefault(DEFAULT_SASS_RULE)) this.useSassRule();
        if(!this.hasDefault(DEFAULT_LESS_RULE)) this.useLessRule();
        if(!this.hasDefault(DEFAULT_JS_RULE)) this.useJsRule();
        if(!this.hasDefault(DEFAULT_FILE_URL_RULE)) this.useFileUrlRule();
        return this;
    }

    /**
     * Définit les valeurs par défaut qui ont été définit
     * @param {string} name
     * @return {WebpackConfig}
     */
    setDefault(name) {
        if(typeof name === "string") {
            if(!defaults[name]) {
                defaults[name] = true;
            }
        }
        return this;
    }

    /**
     * Détermine si une valeur par défaut a été définit
     * @param {string} name
     * @return {boolean}
     */
    hasDefault(name) {
        return defaults[name];
    }

    /**
     * Concat les valeurs passé en paramètre
     * @param {string} strings
     * @return {string}
     */
    concat(...strings) {
        var
            string = ""
        ;
        for (let key in strings) {
            var
                value = strings[key]
            ;
            if(typeof value === "string") {
                string += value;
            }
        }
        return string;
    }

    /**
     * Renvoie le paramètre 1 si l'environnement est DEV sinon le paramètre 2
     * @param {*} val1
     * @param {*} val2
     * @return {*}
     */
    val(val1, val2) {
        return this.isDev() ? val1 : val2;
    }

    /**
     * Détermine si on est en mode DEVELOPMENT
     * @return {boolean}
     */
    isDev() {
        return dev;
    }

    /**
     * Détermine si on est en mode PRODUCTION
     * @return {boolean}
     */
    isProd() {
        return !this.isDev();
    }

    /**
     * Définit si on WATCH Après que les fichiers ont été buildé
     * @param {boolean} watch
     * @return {WebpackConfig}
     */
    setWatch(watch) {
        if(typeof watch === "boolean") {
            config.watch = watch;
        }
        return this;
    }

    /**
     * Ajoute un chemin à ignorer lorsque Webpack est en mode WATCH
     * @param {string} ignore
     * @return {WebpackConfig}
     */
    setIgnoreWatch(ignore) {
        if(typeof ignore === "string") {
            if( !config.watchOptions || !config.watchOptions.ignored ) {
                if(!config.watchOptions) {
                    config.watchOptions = {ignored:[]};
                } else {
                    config.watchOptions.ignored = [];
                }
            }
            if(config.watchOptions.ignored.indexOf(ignore) < 0) {
                config.watchOptions.ignored.push(ignore);
            }
        }
        return this;
    }

    /**
     * Permet d'ignorer le dossier node_modules lors d'un process en DEV
     * @return {WebpackConfig}
     */
    setDefaultIgnoreWatch() {
        this.setDefault(DEFAULT_IGNORE_WATCH);

        if(this.isDev()) {
            this.setIgnoreWatch("**/node_modules");
        }
        return this;
    }

    /**
     * Définit le mode DEVELOPMENT ou PRODUCTION
     * @param {boolean} isDev
     * @return {WebpackConfig}
     */
    setDevMode(isDev) {
        config.mode = isDev ? MODE_DEV : MODE_PROD;
        return this;
    }

    /**
     * Ajoute les Source Map lors du Build
     * @param {boolean} sourceMap
     * @return {WebpackConfig}
     */
    setSourceMap(sourceMap) {
        config.devtool = sourceMap ? "source-map" : false;
        return this;
    }

    /**
     * @param {boolean} errorDetails
     * @return {WebpackConfig}
     */
    setErrorsDetails(errorDetails) {
        config.stats.errorDetails = !!errorDetails;
        return this;
    }

    /**
     * Ajoute une ou plusieurs entrée(s)
     * @param {string} name
     * @param {string} paths
     * @return {WebpackConfig}
     */
    setEntry(name, ...paths) {
        if(typeof name === "string") {
            for (let key in paths) {
                let value = paths[key];
                if(typeof value === "string") {
                    if(!config.entry || !config.entry[name]) {
                        if(!config.entry) {
                            config.entry = {};
                        }
                        config.entry[name] = [];
                    }
                    value = path.resolve(value);
                    if(config.entry[name].indexOf(value) < 0) {
                        config.entry[name].push(value);
                    }
                }
            }
        }
        return this;
    }

    /**
     * Définit les Entrées par défaut
     * @return {WebpackConfig}
     */
    setDefaultEntry() {
        this.setDefault(DEFAULT_ENTRY);

        //this.setEntry(
        //    "ckmk",
        //    "./core/Controllers/Controller/Templating/Admin/Views/resources/css/ckmk.scss",
        //    "./core/Controllers/Controller/Templating/Admin/Views/resources/js/ckmk.js"
        //);
        return this;
    }

    /**
     * Ajoute les sorties pour le Build des fichiers
     * @param {string} dirname
     * @param {string} filename
     * @param {boolean} clean
     */
    setOutput(
        dirname = undefined,
        filename = undefined,
        clean = true
    ) {
        dirname = dirname || this.concat("js/", this.val("base", "min"), "/");
        filename = filename || this.val("[name].js", "[name].[contenthash].min.js");
        if(
            typeof dirname === "string"
            &&
            typeof filename === "string"
            &&
            typeof clean === "boolean"
        ) {
            if(!config.output) config.output = {};
            config.output.path = path.resolve("./public/resources/build/" + dirname);
            config.output.filename = filename;
            config.output.publicPath = "/resources/";
            config.output.clean = clean;
        }
        return this;
    }

    /**
     * Permet de créer un Alias pour les chemins
     * @param {string} name
     * @param {string} dirname
     * @return {WebpackConfig}
     */
    addAlias(name, dirname) {
        if(typeof name === "string" && typeof dirname === "string") {
            if(!config.resolve || !config.resolve.alias) {
                if(config.resolve) {
                    config.resolve.alias = {};
                } else {
                    config.resolve = {alias:{}};
                }
            }
            config.resolve.alias[name] = path.resolve(dirname);
        }
        return this;
    }

    /**
     * Définit les Alias par défaut du projet
     * @return {WebpackConfig}
     */
    addDefaultAlias() {
        this.setDefault(DEFAULT_PATH_ALIAS);
        this
            .addAlias("@co/resources", "./core/Controllers/Controller/Templating/Admin/Views/resources")
            .addAlias("@co/css", "./core/Controllers/Controller/Templating/Admin/Views/resources/css")
            .addAlias("@co/js", "./core/Controllers/Controller/Templating/Admin/Views/resources/js")
            .addAlias("@co/img", "./core/Controllers/Controller/Templating/Admin/Views/resources/img")
            .addAlias("@co/form-default-colors", "./core/Controllers/Controller/Templating/Admin/Views/resources/css/colors/form.default.colors")
            .addAlias("@co/form-script", "./core/Controllers/Controller/Templating/Admin/Views/resources/css/colors/form.script")
            .addAlias("@public", "./public")
            .addAlias("@resources", "./public/resources")
            .addAlias("@assets", "./assets")
        ;
        return this;
    }

    /**
     * Ajoute une Plugin
     * @param {object} plugin
     * @return {WebpackConfig}
     */
    addPlugin(plugin) {
        if(typeof plugin === "object") {
            if(!config.plugins) {
                config.plugins = [];
            }
            config.plugins.push(plugin);
        }
        return this;
    }

    /**
     * Ajoute les Plugin par Défaut
     * @return {WebpackConfig}
     */
    setDefaultPlugin() {
        this.setDefault(DEFAULT_PLUGINS);

        this.addPlugin(new MiniCssExtractPlugin({
            filename: this.val(
                "../../css/base/[name].css",
                "../../css/min/[name].[contenthash].min.css"
            ),
        }));
        return this;
    }

    /**
     * Ajoute une règle pour les fichiers
     * @param {object} rule
     * @return {WebpackConfig}
     */
    addRule(rule) {
        if(typeof rule === "object") {
            if(!config.module || !config.module.rules) {
                if(config.module) {
                    config.module.rules = [];
                } else {
                    config.module = {rules:[]};
                }
            }
            config.module.rules.push(rule);
        }
        return this;
    }

    /**
     * @param {object} fallback
     */
    addFallback(fallback) {
        if(typeof fallback === "object") {
            if(!config.resolve || !config.resolve.fallback) {
                if(config.resolve) {
                    config.resolve.fallback = {};
                } else {
                    config.resolve = {fallback:{}};
                }
            }
            config.resolve.fallback = Object.assign(config.resolve.fallback, fallback);
        }
        return this;
    }

    /**
     * Ajoute les règles par défaut du projet
     * @return {WebpackConfig}
     */
    setDefaultRules() {
        this.setDefault(DEFAULT_RULES);

        this.addRule({
            test : /\.css$/i,
            use : this.getDefaultCssLoader()
        });
        return this;
    }

    /**
     * Ajoute les fallback par défaut du projet
     * @return {WebpackConfig}
     */
    setDefaultFallbacks() {
        this.setDefault(DEFAULT_FALLBACKS);

        this.addFallback({
            crypto : false,
            buffer : false,
        });
        return this;
    }

    /**
     * Ajoute les règles pour les fichiers SCSS ou SASS
     * @return {WebpackConfig}
     */
    useSassRule() {
        this.setDefault(DEFAULT_SASS_RULE);

        this.addRule({
            test : /\.sass$|\.scss$/i,
            use : [
                ...this.getDefaultCssLoader(),
                "sass-loader"
            ]
        });
        return this;
    }

    /**
     * Ajoute les règles pour les fichiers LESS
     * @return {WebpackConfig}
     */
    useLessRule() {
        this.setDefault(DEFAULT_LESS_RULE);

        this.addRule({
            test : /\.less$/i,
            use : [
                ...this.getDefaultCssLoader(),
                "less-loader"
            ]
        });
        return this;
    }

    /**
     * Ajoute les règles pour les fichiers JS
     * @return {WebpackConfig}
     */
    useJsRule() {
        this.setDefault(DEFAULT_JS_RULE);

        this.addRule({
            test: /\.js$/i,
            exclude: /(node_modules|bower_components)/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env']
                }
            }
        });
        return this;
    }

    /**
     * Ajoute les règles pour les url fichiers
     * @return {WebpackConfig}
     */
    useFileUrlRule() {
        this.setDefault(DEFAULT_FILE_URL_RULE);

        this.addRule({
            test: /\.(png|jpg|jpeg|gif|tiff)$/i,
            use: [
                {
                    loader: 'url-loader',
                    options: {
                        limit: 8192,
                        publicPath: "/resources/build/images/",
                        outputPath: "../../images/",
                        name: "[name].[ext]",
                        esModule: false
                    },
                },
            ],
        });

        this.addRule({
            test: /\.(otf|ttf|svg|eot|woff|woff2)$/i,
            use: [
                {
                    loader: 'url-loader',
                    options: {
                        limit: 8192,
                        publicPath: "/resources/build/fonts/",
                        outputPath: "../../fonts/",
                        name: "[name].[ext]",
                        esModule: false
                    },
                },
            ],
        });
        return this;
    }

    /**
     * Renvoie la configuration pour Webpack
     * @return {object}
     */
    getConfig() {
        this[METHOD_REQUIRE_DEFAULTS]();
        return config;
    }

}

module.exports = new WebpackConfig();