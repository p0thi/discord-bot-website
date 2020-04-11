module.exports = {
  transpileDependencies: ["vuetify"],
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.worker\.js$/,
          use: { loader: "worker-loader" }
        }
      ]
    }
  },
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        appId: "de.glowtrap.bot",
        productName: "Pothi-Bot Manager",
        win: {
          icon: "./public/logo_round.png"
        },
        linux: {
          icons: "./public/logo_round.png"
        }
      }
    }
  }
};
