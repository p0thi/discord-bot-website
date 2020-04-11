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
        nsis: {
          oneClick: false,
          perMachine: true
        },
        win: {
          icon: "public/logo_round.png",
          target: ["nsis"]
        },
        mac: {
          icon: "public/logo_round.png",
          target: ["dmg"]
        },
        linux: {
          icon: "public/logo_round.png",
          target: ["AppImage"]
        },
        publish: [
          {
            provider: "github",
            owner: "p0thi",
            repo: "discord-bot-website"
          }
        ]
      }
    }
  }
};
