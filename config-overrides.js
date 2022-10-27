const SemiWebpackPlugin = require('@douyinfe/semi-webpack-plugin').default;

module.exports = {
    // The Webpack config to use when compiling your react app for development or production.
    webpack: function(config, env) {
        console.log('env: ', env)
        config.plugins.unshift(
            new SemiWebpackPlugin({
                theme: '@semi-bot/semi-theme-biliaudio',
                include: '~@semi-bot/semi-theme-biliaudio/scss/local.scss'
            })
        )
        return config;
    },
}