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
          perMachine: true,
          allowToChangeInstallationDirectory: true
        },
        appImage: {
          desktop: {
            Name: "Pothi-Bot Manager",
            Comment: "Manager for the Pothi-Bot on discord"
          },
          artifactName: "${productName}.${ext}"
        },
        win: {
          target: ["portable", "nsis"]
        },
        mac: {
          target: ["dmg"]
        },
        linux: {
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
