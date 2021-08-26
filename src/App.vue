<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <div class="d-flex align-center">
        <v-img
          alt="Vuetify Logo"
          class="shrink mr-2 round-img elevation-2"
          contain
          src="@/assets/logo.png"
          transition="scale-transition"
          width="40"
        />
        <h1 :class="{ title: $vuetify.breakpoint.smAndDown }">Pothi-Bot</h1>
      </div>

      <v-spacer></v-spacer>
      <!-- <p>{{size}}</p> -->

      <span v-if="isLoggedIn">
        <v-sheet class="pa-2 mt-2">
          <v-avatar size="35" class="mr-3">
            <v-img :src="user.displayAvatarURL"></v-img>
          </v-avatar>
          <span v-if="$vuetify.breakpoint.smAndUp" class="title">
            {{ user.username }}
          </span>
          <span v-if="$vuetify.breakpoint.smAndUp" class="body-1"
            >#{{ user.discriminator }}</span
          >
          <v-divider
            v-if="$vuetify.breakpoint.smAndUp"
            class="mx-4"
            inset
            vertical
          ></v-divider>
          <v-btn @click="logout" text>
            <span class="mr-2">Logout</span>
            <v-icon>mdi-logout</v-icon>
          </v-btn>
        </v-sheet>
      </span>

      <v-btn v-else @click="login" text>
        <span class="mr-2">Login with discord</span>
        <v-progress-circular
          :size="30"
          :width="3"
          indeterminate
          v-if="authStatus === 'auth'"
        ></v-progress-circular>
        <v-icon v-else>mdi-discord</v-icon>
      </v-btn>

      <template v-slot:extension>
        <v-tabs align-with-title>
          <v-tab to="/">Home</v-tab>
          <v-tab to="/guilds">My Discord Servers</v-tab>
          <!-- <v-tab v-if="isLoggedIn">Einstellungen</v-tab> -->
        </v-tabs>
      </template>
    </v-app-bar>

    <v-content>
      <v-banner
        v-if="!isWebsite"
        v-model="updateAvailable"
        class="primary--text"
      >
        <span v-if="updateAvailable && !updating && !updateFinished"
          >New Version available</span
        >

        <span v-if="updating && !updateProgress">Preparing...</span>

        <div v-if="updateProgress && !updateFinished">
          <v-row style="width: 95vw">
            <!-- <v-col class="align-self-center" cols="1">{{updateProgress.percent}}%</v-col> -->
            <v-col class="align-self-center">
              <v-progress-linear :value="updateProgress.percent" height="15">
                <template v-slot="{ value }">
                  <strong class="body-2 white--text"
                    >{{ Math.ceil(value) }}%</strong
                  >
                </template>
              </v-progress-linear>
            </v-col>
            <v-col class="align-self-center" cols="2">
              <span class="subtitle-1 font-weight-black"
                >{{
                  (updateProgress.bytesPerSecond / 1048576).toFixed(2)
                }}
                Mb/s</span
              >
            </v-col>
          </v-row>
        </div>

        <span v-if="updateFinished">Update finished</span>

        <template
          v-if="updateFinished || updateAvailable"
          v-slot:actions="{ dismiss }"
        >
          <v-btn
            v-if="updateAvailable && !updating && !updateFinished"
            text
            @click="openReleases"
            >Download manually</v-btn
          >
          <v-btn
            v-if="updateAvailable && !updating && !updateFinished"
            text
            @click="install"
            >Install new version</v-btn
          >
          <v-btn
            v-if="updateAvailable && !updating && !updateFinished"
            text
            @click="dismiss"
            >Not now</v-btn
          >

          <v-btn v-if="updateFinished" text @click="restartApp"
            >Install now</v-btn
          >
          <v-btn v-if="updateFinished" text @click="dismiss"
            >Restart later</v-btn
          >
        </template>
      </v-banner>
      <v-container :fluid="$vuetify.breakpoint.mdAndDown">
        <router-view></router-view>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
let ipcRenderer, shell;
if (process.env.VUE_APP_ELECTRON_ENV) {
  const electron = require("electron");
  ipcRenderer = electron.ipcRenderer;
  shell = electron.shell;
}

export default {
  name: "App",
  created() {
    this.fetchUser();
    this.fetchPermissions();
    this.fetchClientDetails();
    this.fetchCommandsDescriptions();
    if (process.env.VUE_APP_ELECTRON_ENV) {
      ipcRenderer.on("checking-for-update", () => {});
      ipcRenderer.on("update-available", () => {
        this.updateAvailable = true;
      });
      ipcRenderer.on("update-not-available", () => {
        this.updateAvailable = false;
        this.updating = false;
      });
      ipcRenderer.on("update-error", () => {
        this.updateAvailable = false;
        this.updating = false;
      });
      ipcRenderer.on("update-download-progress", (event, data) => {
        this.updating = true;
        this.updateProgress = data;
      });
      ipcRenderer.on("update-downloaded", () => {
        this.updating = false;
        this.updateFinished = true;
        this.updateProgress = {};
      });
    }
  },
  ...(process.env.VUE_APP_ELECTRON_ENV && {
    beforeDestroy() {
      ipcRenderer.removeAllListeners("checking-for-update");
      ipcRenderer.removeAllListeners("update-available");
      ipcRenderer.removeAllListeners("update-not-available");
      ipcRenderer.removeAllListeners("update-error");
      ipcRenderer.removeAllListeners("update-download-progress");
      ipcRenderer.removeAllListeners("update-downloaded");
    },
  }),
  components: {},
  computed: {
    ...mapGetters(["isLoggedIn", "authStatus", "user"]),
    size() {
      return this.$vuetify.breakpoint.name;
    },
  },
  methods: {
    ...mapActions([
      "login",
      "logout",
      "fetchUser",
      "fetchPermissions",
      "fetchClientDetails",
      "fetchCommandsDescriptions",
    ]),
    ...(process.env.VUE_APP_ELECTRON_ENV && {
      restartApp() {
        ipcRenderer.send("restart-app");
      },
      openReleases() {
        shell.openExternal(
          "https://github.com/p0thi/discord-bot-website/releases/"
        );
      },
      install() {
        ipcRenderer.send("download-update");
      },
    }),
  },
  data: () => ({
    ...(process.env.VUE_APP_ELECTRON_ENV && {
      updateAvailable: false,
      updating: false,
      updateProgress: undefined,
      updateFinished: false,
    }),
    isWebsite: !process.env.VUE_APP_ELECTRON_ENV,
  }),
};
</script>
<style lang="scss">
#app {
  background-color: #f5f5f5;
}

@media (min-width: 1264px) {
  .container {
    max-width: 1250px !important;
  }
}

@media (min-width: 960px) {
  .container {
    max-width: 950px;
  }
}

.round-img {
  border-radius: 50%;
}
.snackbar {
  .v-snack__wrapper {
    .v-snack__content {
      .vts__message {
        font-size: 1.25rem;
        color: white;
      }
    }
  }
}
</style>
