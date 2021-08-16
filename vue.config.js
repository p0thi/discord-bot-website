const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = {
  transpileDependencies: ["vuetify", "vuex-persist"],
  configureWebpack: {
    resolve: {
      fallback: { assert: false, fs: false, stream: false },
    },
    module: {
      rules: [
        {
          test: /\.worker\.js$/,
          use: { loader: "worker-loader" },
        },
        {
          test: /\.node$/,
          loader: "node-loader",
        },
      ],
    },
    plugins: [
      new NodePolyfillPlugin({
        excludeAliases: [
          "console",
          "process",
          "assert",
          "console",
          "constants",
          "crypto",
          "domain",
          "events",
          "http",
          "https",
          "os",
          "punycode",
          "process",
          "querystring",
          "stream",
          "_stream_duplex",
          "_stream_passthrough",
          "_stream_readable",
          "_stream_transform",
          "_stream_writable",
          "string_decoder",
          "sys",
          "timers",
          "tty",
          "url",
          "util",
          "vm",
          "zlib",
        ],
      }),
    ],
  },
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        asar: true,
        appId: "eu.pothi.sounds",
        productName: "Pothi-Bot Manager",
        nsis: {
          oneClick: false,
          perMachine: true,
          allowToChangeInstallationDirectory: true,
        },
        appImage: {
          desktop: {
            Name: "Pothi-Bot Manager",
            Comment: "Manager for the Pothi-Bot on discord",
          },
          artifactName: "${productName}.${ext}",
        },
        win: {
          target: ["portable", "nsis"],
        },
        mac: {
          target: ["dmg"],
        },
        linux: {
          target: ["AppImage"],
        },
        publish: [
          {
            provider: "github",
            owner: "p0thi",
            repo: "discord-bot-website",
          },
        ],
      },
    },
  },
};
