<template>
  <v-card outlined>
    <v-card-title>
      <span>{{ commandPrefix }}</span>
      <span>{{ sound.command }}</span>
      <v-spacer></v-spacer>

      <v-menu top :close-on-content-click="false">
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
            <span>Sound anhören</span>
          </v-tooltip>
        </template>

        <audio-player
          :file="audioFile"
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

      <v-tooltip bottom>
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
        <span>{{
          isJoinSound ? "Join-Sound aktiv" : "Join-Sound nicht aktiv"
        }}</span>
      </v-tooltip>
    </v-card-title>
    <v-card-subtitle>{{ sound.description }}</v-card-subtitle>
    <v-card-actions>
      <v-btn :loading="soundPlaying" @click="playSound" color="success" icon>
        <v-icon large>mdi-play</v-icon>
      </v-btn>

      <v-spacer v-if="isWebsite"></v-spacer>
      <div v-if="editable">
        <v-btn @click="deleteSound" color="red" icon>
          <v-icon>mdi-delete-forever</v-icon>
        </v-btn>
      </div>
      <v-spacer v-if="!isWebsite"></v-spacer>
      <span v-if="!isWebsite" class="font-weight-bold">{{ hotkey }}</span>
      <v-btn
        v-if="!hotkeyText && !isWebsite"
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
        @click="deleteHotkey"
        v-if="!!hotkeyText && !isWebsite"
        :color="recording ? 'red' : 'black'"
        text
      >
        <span>{{ hotkeyText }}</span>
        <v-icon class="ml-2">mdi-close</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
<script>
import axios from "axios";
import { mapGetters } from "vuex";
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
    AudioPlayer: () => import("./AudioPlayer")
  },
  ...(process.env.VUE_APP_ELECTRON_ENV && {
    created() {
      ipcRenderer.once(`send-hotkeys-${this.sound.id}`, (event, data) => {
        if (data.error) {
          return;
        }
        if (data.hotkeys) {
          this.hotkeyText = data.hotkeys.join("+");
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
    }
  }),
  methods: {
    ...(process.env.VUE_APP_ELECTRON_ENV && {
      handleHotkeyUpdate(event, data) {
        if (data) {
          this.hotkeyText = data.join("+");
        } else {
          this.hotkeyText = undefined;
        }
      },
      recordHotkey() {
        this.recording = true;
        const recorder = new HotkeyRecorder();
        recorder.record(
          () => {
            // console.log(recorder.isRecording());
            // console.log(recorder.getNamesFromKeys("de").join("+"));
            this.hotkeyText = recorder.getNamesFromKeys("de").join("+");
          },
          keys => {
            this.recording = false;
            // console.log(recorder.isRecording());
            // console.log("finish", keys);
            new Promise((resolve, reject) => {
              import("electron")
                .then(electron => {
                  const ipcRenderer = electron.ipcRenderer;
                  ipcRenderer.once(
                    `store-hotkey-response-${this.sound.id}`,
                    (event, data) => {
                      if (data.error) {
                        reject(data.error);
                      } else {
                        resolve(data);
                      }
                    }
                  );
                  const register = {
                    id: this.sound.id,
                    keys: keys.sort(),
                    names: recorder.getNamesFromKeys("electron_us"),
                    localeNames: recorder.getNamesFromKeys("de")
                  };
                  console.log("register:", register);
                  ipcRenderer.send("store-hotkey", register);
                })
                .catch(() => reject());
            }).catch(e => console.log(e));
          }
        );
      },
      deleteHotkey() {
        // console.log("deleting hotkey for", this.sound.command);
        ipcRenderer.send("delete-hotkey", this.sound);
      }
    }),
    setListening(val) {
      this.listening = val;
    },
    toggleJoinSound() {
      this.$confirm(
        `Willst du diesen Sound wirklich als Join-Sound ${
          this.isJoinSound ? "DEAKTIVIEREN" : "AKTIVIEREN"
        }?`,
        {
          buttonTrueText: "Ja",
          buttonFalseText: "Nein"
        }
      ).then(res => {
        if (res) {
          this.changingJoinSound = true;
          axios
            .post(
              `${process.env.VUE_APP_API_BASE_URL}/api/sounds/joinsound`,
              {
                ...(!this.isJoinSound && { sound: this.sound.id }),
                ...(this.isJoinSound && { guild: this.guildId })
              },
              {
                headers: {
                  "Content-Type": "Application/json"
                }
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
        .get(`${process.env.VUE_APP_API_BASE_URL}/api/sounds/play`, {
          params: {
            id: this.sound.id
          },
          timeout: 40000
        })
        .catch(e => {
          if (e.response) {
            switch (e.response.status) {
              case 409:
                this.$toast.error(
                  "Du befindest dich in keinem Channel auf diesem Server, den der Bot erreichen kann.",
                  {
                    dismissable: true,
                    queueable: true
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
      this.$confirm("Wirklich diesen Sound ENDGÜLTIG löschen?", {
        buttonTrueText: "Ja",
        buttonFalseText: "Nein"
      }).then(res => {
        if (res) {
          axios({
            url: `${process.env.VUE_APP_API_BASE_URL}/api/sounds/delete`,
            method: "DELETE",
            data: {
              sound: this.sound.id
            }
          })
            .then(() => {
              this.$toast.success(`Befehl erfolgreich gelöscht`, {
                dismissable: true,
                queueable: true
              });
              this.$emit("deleted");
            })
            .catch(() => {
              this.$toast.error(`Der Befehl konnte nicht gelöscht werden.`, {
                dismissable: true,
                queueable: true
              });
            });
        }
      });
      return;
    }
  },
  computed: {
    ...mapGetters(["token"]),
    recording: {
      get() {
        return this.recordingState;
      },
      set(value) {
        this.$emit("recordingState", value);
        this.recordingState = value;
      }
    },
    audioFile() {
      return `${process.env.VUE_APP_API_BASE_URL}/api/sounds/listen/${this.sound.id}?token=${this.token}`;
    }
  },
  props: {
    commandPrefix: { type: String, required: true },
    sound: { type: Object, required: true },
    guildId: { type: String, required: true },
    editable: { type: Boolean, default: false },
    isJoinSound: { typpe: Boolean, default: false },
    hotkey: { type: String, required: false }
  },
  data() {
    return {
      isWebsite: !process.env.VUE_APP_ELECTRON_ENV,
      soundPlaying: false,
      listening: false,
      changingJoinSound: false,
      hotkeyText: undefined,
      recordingState: false
      // recorder: undefined,
    };
  }
};
</script>
<style lang="scss">
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
