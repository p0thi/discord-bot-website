<template>
  <v-card outlined>
    <v-card-title class="d-flex flex-row-reverse">
      <div>
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn
              @click="toggleFavourite"
              v-on="on"
              :color="isFavourite ? 'primary' : 'grey'"
              :loading="favouriteLoading"
              icon
            >
              <v-icon>
                {{ isFavourite ? "mdi-star" : "mdi-star-outline" }}
              </v-icon>
            </v-btn>
          </template>
          <span>{{ isFavourite ? "Remove favorite" : "Favor" }}</span>
        </v-tooltip>

        <v-menu v-model="playerMenu" top :close-on-content-click="false">
          <template v-slot:activator="{ on: menu }">
            <v-tooltip bottom>
              <template v-slot:activator="{ on: tooltip }">
                <v-btn v-on="{ ...tooltip, ...menu }" icon>
                  <v-icon
                    :class="{ shake: listening }"
                    :color="listening ? 'green' : ''"
                    >mdi-music-note</v-icon
                  >
                </v-btn>
              </template>
              <span>Listen to sound</span>
            </v-tooltip>
          </template>

          <audio-player
            v-if="playerMenu"
            :file="audioFile"
            :autoPlay="true"
            :sound="sound"
            @playing="setListening"
            color="primary"
            downloadable
          ></audio-player>
          <!-- <audio controls>
            <source :src="audioFile">
            Der Browser unterstützt dieses Format nicht
          </audio>-->
        </v-menu>

        <v-tooltip v-if="canUseJoinSound || guild.owner" bottom>
          <template v-slot:activator="{ on }">
            <v-btn
              v-on="on"
              @click="toggleJoinSound"
              :loading="changingJoinSound"
              :color="isJoinSound ? 'primary' : '#c9c9c9'"
              icon
            >
              <v-icon>mdi-location-enter</v-icon>
            </v-btn>
          </template>
          <span>
            {{ isJoinSound ? "Remove join sound" : "Set join sound" }}
          </span>
        </v-tooltip>
      </div>
      <span class="mr-auto">{{ commandPrefix }}{{ sound.command }}</span>
    </v-card-title>
    <v-card-subtitle>
      <div>{{ sound.description }}</div>
      <slot name="date"></slot>
    </v-card-subtitle>
    <v-card-actions>
      <v-btn
        v-if="canPlaySounds || guild.owner"
        :loading="soundPlaying"
        @click="playSound"
        color="success"
        icon
      >
        <v-icon large>mdi-play</v-icon>
      </v-btn>

      <v-spacer v-if="isWebsite"></v-spacer>
      <div
        v-if="
          !guild.banned && (sound.creator || guild.owner || canDeleteAllSounds)
        "
      >
        <v-btn @click="deleteSound" color="red" icon>
          <v-icon>mdi-delete-forever</v-icon>
        </v-btn>
      </div>
      <v-spacer v-if="!isWebsite && (canPlaySounds || guild.owner)"></v-spacer>
      <span v-if="!isWebsite" class="font-weight-bold">{{ hotkey }}</span>
      <v-btn
        v-if="!hotkeys && !isWebsite && (canPlaySounds || guild.owner)"
        @click="recordHotkey"
        :color="recording ? 'red' : 'grey'"
        text
      >
        <span>REC Hotkey</span>
        <v-icon v-if="!recording" color="red">mdi-record</v-icon>
        <v-progress-circular
          v-else
          class="ml-2"
          :size="15"
          :width="2"
          indeterminate
        ></v-progress-circular>
      </v-btn>
      <v-btn
        class="hotkey-button"
        @click="deleteHotkey"
        v-if="!!hotkeys && !isWebsite && (canPlaySounds || guild.owner)"
        :color="recording ? 'red' : 'black'"
        text
      >
        <span>
          {{
            hotkeys.map((k) => (k.length > 1 ? k : k.toUpperCase())).join(" + ")
          }}
        </span>
        <v-icon class="ml-2">mdi-close</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
<script>
import axios from "axios";
import { mapGetters, mapActions } from "vuex";
import HotkeyRecorder from "../util/HotkeyRecorder";
// const HotkeyRecorder = () => import("../util/HotkeyRecorder")
// if (process.env.VUE_APP_ELECTRON_ENV)
//   const HotkeyRecorder = require("../util/HotkeyRecorder")
let ipcRenderer;
if (process.env.VUE_APP_ELECTRON_ENV) {
  ipcRenderer = require("electron").ipcRenderer;
  // import("electron").then(electron => {
  //   ipcRenderer = electron.ipcRenderer;
  // });
}

export default {
  //   name: "sound-list-tile",
  components: {
    AudioPlayer: () => import("./AudioPlayer"),
  },
  ...(process.env.VUE_APP_ELECTRON_ENV && {
    created() {
      ipcRenderer.once(`send-hotkeys-${this.sound.id}`, (event, data) => {
        console.log("data", data);
        if (data.error) {
          return;
        }
        if (data.hotkeys) {
          this.hotkeys = data.hotkeys;
        }
      });
      ipcRenderer.send("get-hotkeys", this.sound);

      ipcRenderer.on(
        `hotkey-updated-${this.sound.id}`,
        this.handleHotkeyUpdate
      );
    },
    beforeDestroy() {
      ipcRenderer.removeListener(
        `hotkey-updated-${this.sound.id}`,
        this.handleHotkeyUpdate
      );
    },
  }),
  methods: {
    ...mapActions(["fetchUser"]),
    ...(process.env.VUE_APP_ELECTRON_ENV && {
      handleHotkeyUpdate(event, data) {
        if (data) {
          this.hotkeys = data;
        } else {
          this.hotkeys = undefined;
        }
      },
      recordHotkey() {
        this.recording = true;
        const recorder = new HotkeyRecorder(
          () => {
            // console.log(recorder.isRecording());
            // console.log(recorder.getNamesFromKeys("de").join("+"));
            this.hotkeys = recorder.getLocaleNames();
          },
          (keys) => {
            this.recording = false;
            // console.log(recorder.isRecording());
            // console.log("finish", keys);
            new Promise((resolve, reject) => {
              import("electron")
                .then((electron) => {
                  const ipcRenderer = electron.ipcRenderer;
                  ipcRenderer.once(
                    `store-hotkey-response-${this.sound.id}`,
                    (event, data) => {
                      console.log("data##", data);
                      if (data.error) {
                        reject(data.error);
                      } else {
                        resolve(data);
                      }
                    }
                  );
                  const register = {
                    id: this.sound.id,
                    guild: this.guild.id,
                    keys: keys.sort(),
                    names: recorder.getElectronNames(keys),
                    localeNames: recorder.getLocaleNames(),
                  };
                  console.log("'BAUM", register);

                  console.log("register:", register);
                  ipcRenderer.send("store-hotkey", register);
                })
                .catch((e) => {
                  console.log(e);
                  reject("error importing electron");
                });
            }).catch((e) => {
              this.hotkeyText = undefined;
              this.$toast.error(e, {
                dismissable: true,
                queueable: true,
              });
              console.log(e);
            });
          },
          () => {
            this.$toast.error("Error recording the hotkey...", {
              dismissable: true,
              queueable: true,
            });
          }
        );

        recorder.record();
      },
      deleteHotkey() {
        // console.log("deleting hotkey for", this.sound.command);
        ipcRenderer.send("delete-hotkey", this.sound);
      },
    }),
    setListening(val) {
      this.listening = val;
    },
    toggleJoinSound() {
      this.$confirm(
        `Do you really want to  ${
          this.isJoinSound ? "DEACTIVATE" : "ACTIVATE"
        } the join sound?`,
        {
          buttonTrueText: "Yes",
          buttonFalseText: "No",
        }
      ).then((res) => {
        if (res) {
          this.changingJoinSound = true;
          axios
            .post(
              `${
                process.env.VUE_APP_API_BASE_URL ||
                `${window.location.protocol}//${window.location.host}`
              }/api/sounds/joinsound`,
              {
                ...(!this.isJoinSound && { sound: this.sound.id }),
                ...(this.isJoinSound && { guild: this.guild.id }),
              },
              {
                headers: {
                  "Content-Type": "Application/json",
                },
              }
            )
            .then(() => {
              this.$emit("joinValueChanged", !this.isJoinSound);
            })
            .finally(() => {
              this.changingJoinSound = false;
            });
        }
      });
    },
    playSound() {
      this.soundPlaying = true;
      axios
        .get(
          `${
            process.env.VUE_APP_API_BASE_URL ||
            `${window.location.protocol}//${window.location.host}`
          }/api/sounds/play`,
          {
            params: {
              id: this.sound.id,
            },
            timeout: 40000,
          }
        )
        .catch((e) => {
          if (e.response) {
            switch (e.response.status) {
              case 409:
                this.$toast.error(
                  "You are not in any channel on this server that the bot can reach.",
                  {
                    dismissable: true,
                    queueable: true,
                  }
                );
                break;
            }
          }
        })
        .finally(() => {
          this.soundPlaying = false;
        });
    },
    deleteSound() {
      this.$confirm("Really delete this sound FINALLY?", {
        buttonTrueText: "Yes",
        buttonFalseText: "No",
      }).then((res) => {
        if (res) {
          axios({
            url: `${
              process.env.VUE_APP_API_BASE_URL ||
              `${window.location.protocol}//${window.location.host}`
            }/api/sounds/delete`,
            method: "DELETE",
            data: {
              sound: this.sound.id,
            },
          })
            .then(() => {
              this.$toast.success(`Command deleted successfully`, {
                dismissable: true,
                queueable: true,
              });
              this.$emit("deleted");
            })
            .catch(() => {
              this.$toast.error(`The command could not be deleted.`, {
                dismissable: true,
                queueable: true,
              });
            });
        }
      });
      return;
    },
    toggleFavourite() {
      console.log("toggle favourite sound");
      this.favouriteLoading = true;
      const method = this.isFavourite ? "remove" : "add";
      axios
        .post(
          `${
            process.env.VUE_APP_API_BASE_URL ||
            `${window.location.protocol}//${window.location.host}`
          }/api/sounds/favourite/${method}`,
          { sound: this.sound.id }
        )
        .then(() => {
          switch (method) {
            case "remove": {
              this.user.favouriteSounds.splice(
                this.user.favouriteSounds.indexOf(this.sound.id),
                1
              );
              break;
            }
            case "add": {
              this.user.favouriteSounds.push(this.sound.id);
              break;
            }
          }
          this.fetchUser();
        })
        .catch((err) => console.log(err))
        .finally(() => {
          this.favouriteLoading = false;
        });
    },
  },
  computed: {
    ...mapGetters(["token", "user"]),
    recording: {
      get() {
        return this.recordingState;
      },
      set(value) {
        this.$emit("recordingState", value);
        this.recordingState = value;
      },
    },
    audioFile() {
      return `${
        process.env.VUE_APP_API_BASE_URL ||
        `${window.location.protocol}//${window.location.host}`
      }/api/sounds/listen/${this.sound.id}?token=${this.token}`;
    },
    isFavourite() {
      if (!this.user || !this.user.favouriteSounds) {
        return false;
      }
      return this.user.favouriteSounds.includes(this.sound.id);
    },
    canDeleteAllSounds() {
      return (
        this.guild.userPermissions?.includes("DELETE_ALL_SOUNDS") &&
        !this.guild.banned
      );
    },
    canUseJoinSound() {
      return (
        this.guild.userPermissions?.includes("USE_JOIN_SOUND") &&
        !this.guild.banned
      );
    },
    canPlaySounds() {
      return (
        this.guild.userPermissions?.includes("PLAY_SOUNDS") &&
        !this.guild.banned
      );
    },
  },
  props: {
    commandPrefix: { type: String, required: true },
    sound: { type: Object, required: true },
    guild: { type: Object, required: true },
    showCreationDate: { type: Boolean, default: false },
    isJoinSound: { typpe: Boolean, default: false },
    hotkey: { type: String, required: false },
  },
  data() {
    return {
      isWebsite: !process.env.VUE_APP_ELECTRON_ENV,
      soundPlaying: false,
      listening: false,
      changingJoinSound: false,
      hotkeys: undefined,
      recordingState: false,
      favouriteLoading: false,
      playerMenu: false,
      // recorder: undefined,
    };
  },
};
</script>
<style lang="scss">
.hotkey-button {
  text-transform: none;
}
.shake {
  animation: shake-animation 1s ease infinite;
}

@keyframes shake-animation {
  0% {
    transform: rotate(0deg);
  }
  10% {
    transform: rotate(20deg);
  }
  20% {
    transform: rotate(0deg);
  }
  30% {
    transform: rotate(-20deg);
  }
  40% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(20deg);
  }
  60% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(0deg);
  }
}
</style>
