<template>
  <v-row>
    <v-col cols="12">
      <v-card outlined>
        <v-card-title>
          <span>Server auswählen</span>
          <v-spacer></v-spacer>
          <v-text-field
            class="mx-4"
            v-model="guildSearchString"
            flat
            hide-details
            label="Suchen"
            clearable
            prepend-inner-icon="mdi-magnify"
            solo-inverted
          ></v-text-field>
        </v-card-title>
        <v-card-text>
          <v-col
            v-if="
              !guilds ||
                guilds.length === 0 ||
                filteredSortedGuilds.length === 0
            "
          >
            <span v-if="fetchingGuilds">
              Lädt...
              <v-progress-linear
                indeterminate
                color="primary"
              ></v-progress-linear>
            </span>
            <span v-else-if="filteredSortedGuilds.length === 0"
              >Zu dieser Suche wurde kein Server gefunden</span
            >
            <span v-else>Kein Server geladen oder vorhanden</span>
          </v-col>
          <v-slide-group v-else v-model="slide" show-arrows mandatory>
            <v-slide-item
              v-for="guild in filteredSortedGuilds"
              :key="guild.id"
              v-slot:default="{ active, toggle }"
              :value="guild.id"
            >
              <v-card
                @click="toggle"
                class="ma-3 mb-5"
                :style="active ? 'border: 2px solid orange;' : ''"
                :color="getPalette(guild.id).first"
                :elevation="active ? 9 : 2"
              >
                <div class="d-flex flex-no-wrap justify-space-around">
                  <div :style="{ color: getPalette(guild.id).second }">
                    <v-card-title class="headline">
                      {{ guild.name }}
                    </v-card-title>
                    <v-card-subtitle
                      :style="{ color: getPalette(guild.id).second }"
                    >
                      <div>{{ guild.sounds.length }} Sounds verfügbar</div>
                      <div class="body-2 font-weight-thin">
                        <span>Kommando-Symbol:</span>
                        <span class="font-weight-bold">{{
                          guild.commandPrefix
                        }}</span>
                      </div>
                    </v-card-subtitle>
                  </div>
                  <v-avatar class="ma-3" size="75">
                    <v-img
                      v-if="guild.icon"
                      :ref="`img-${guild.id}`"
                      :src="guild.icon"
                    ></v-img>
                  </v-avatar>
                </div>
              </v-card>
            </v-slide-item>
          </v-slide-group>

          <!-- <v-row>
            <v-col v-if="!guilds || guilds.length === 0">
              <span v-if="fetchingGuilds">
                Lädt...
                <v-progress-linear indeterminate color="primary"></v-progress-linear>
              </span>
              <span v-else>Kein Server geladen oder vorhanden</span>
            </v-col>
            <v-col v-else cols="12" :md="3">
              <v-card
                v-for="guild in guilds"
                :key="guild.id"
                :class="{ 'mx-3': guild !== activeGuild, 'my-3': true }"
                :elevation="guild === activeGuild ? 5 : 0"
                @click="
                  () => {
                    activeGuild = guild;
                  }
                "
                :color="getPalette(guild.id).first"
              >
                <div class="d-flex flex-no-wrap justify-space-around">
                  <div :style="{ color: getPalette(guild.id).second }">
                    <v-card-title class="headline">{{ guild.name }}</v-card-title>
                    <v-card-subtitle :style="{ color: getPalette(guild.id).second }">
                      <div>{{ guild.sounds.length }} Sounds verfügbar</div>
                      <div class="body-2 font-weight-thin">
                        <span>Kommando-Symbol:</span>
                        <span class="font-weight-bold">
                          {{
                          guild.commandPrefix
                          }}
                        </span>
                      </div>
                    </v-card-subtitle>
                  </div>
                  <v-avatar class="ma-3" :size="guild !== activeGuild ? '75' : '85'">
                    <v-img v-if="guild.icon" :ref="`img-${guild.id}`" :src="guild.icon"></v-img>
                  </v-avatar>
                </div>
              </v-card>
            </v-col>
          </v-row>-->
        </v-card-text>
      </v-card>
    </v-col>
    <v-col v-if="activeGuild" cols="12">
      <v-card v-if="filteredSortedGuilds.length > 0" outlined>
        <v-card-title>
          <span>
            <v-avatar
              :color="!activeGuild.icon ? 'primary' : 'none'"
              class="mr-3"
              size="50"
            >
              <v-img v-if="activeGuild.icon" :src="activeGuild.icon"></v-img>
              <span style="color: white" v-else>
                {{ activeGuild.name.toUpperCase().charAt(0) }}
              </span>
            </v-avatar>
          </span>
          <span v-if="!!activeGuild" class="display-1">{{
            activeGuild.name
          }}</span>
          <v-spacer></v-spacer>

          <v-dialog v-model="addSoundDialog" persistent max-width="600px">
            <template v-slot:activator="{ on }">
              <v-btn color="primary" dark v-on="on">
                Sound Hinzufügen
                <v-icon>mdi-plus</v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-form
                ref="addSoundForm"
                @submit.prevent="submitUploadSoundForm"
              >
                <v-card-title>
                  <span class="headline">Neuen Sound hinzufügen</span>
                </v-card-title>
                <v-card-text>
                  <v-text-field
                    counter
                    class="mb-5"
                    :rules="validationRules.command"
                    placeholder="Befehl"
                    v-model="addSoundFormData.command"
                    :hint="
                      `Befehl ohne ${activeGuild.commandPrefix} am Anfang eingeben`
                    "
                    required
                  >
                    <template v-slot:prepend>
                      <span class="title">{{ activeGuild.commandPrefix }}</span>
                    </template>
                  </v-text-field>
                  <v-textarea
                    counter
                    :rules="validationRules.description"
                    filled
                    v-model="addSoundFormData.description"
                    placeholder="Beschreibung für den Sound"
                    required
                  ></v-textarea>
                  <v-file-input
                    placeholder="Datei auswählen"
                    show-size
                    v-model="addSoundFormData.file"
                    accept="audio/flac, audio/mp3"
                    required
                  ></v-file-input>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    color="blue darken-1"
                    text
                    @click="closeUploadSoundDialog"
                    >Schließen</v-btn
                  >
                  <v-btn color="blue darken-1" text type="submit"
                    >Speichern</v-btn
                  >
                </v-card-actions>
              </v-form>
            </v-card>
          </v-dialog>
          <v-spacer></v-spacer>
          <v-menu :close-on-content-click="false">
            <template v-slot:activator="{ on }">
              <v-btn color="primary" dark v-on="on" icon>
                <v-icon>mdi-sort-variant</v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-title>Sortierung</v-card-title>
              <v-card-text>
                <v-btn-toggle v-model="sortDirection">
                  <v-btn :value="-1" icon>
                    <v-icon>mdi-sort-descending</v-icon>
                  </v-btn>
                  <v-btn :value="1" icon>
                    <v-icon>mdi-sort-ascending</v-icon>
                  </v-btn>
                </v-btn-toggle>
                <v-radio-group v-model="sortMethod">
                  <v-radio
                    v-for="(item, i) in soundSortings"
                    :key="item.name"
                    :label="item.name"
                    :value="i"
                  ></v-radio>
                </v-radio-group>
              </v-card-text>
            </v-card>
          </v-menu>
          <v-btn
            :loading="fetchingGuilds"
            large
            @click="reload"
            class="mr-5"
            icon
          >
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
          <v-text-field
            class="mx-4"
            v-model="soundSearchString"
            flat
            hide-details
            label="Suchen"
            clearable
            prepend-inner-icon="mdi-magnify"
            solo-inverted
          ></v-text-field>
        </v-card-title>
        <v-card-text>
          <v-row v-if="activeGuild && activeGuild.sounds.length > 0">
            <v-col
              v-for="(sound, i) in getPaginatedSounds"
              :key="sound.id + i"
              cols="12"
              sm="6"
              md="4"
              lg="3"
            >
              <sound-list-tile
                @joinValueChanged="soundJoinValueChanged(sound, $event)"
                @recordingState="recordingStateChange"
                :commandPrefix="activeGuild.commandPrefix"
                :sound="sound"
                :guildId="activeGuild.id"
                :editable="sound.creator || activeGuild.owner"
                :isJoinSound="activeGuild.joinSound === sound.id"
              ></sound-list-tile>
            </v-col>
          </v-row>
          <v-row v-else>
            <v-col>Bisher keine Sounds verfügbar</v-col>
          </v-row>
          <v-row v-if="paginationLength > 1">
            <v-col>
              <v-pagination
                :length="paginationLength"
                v-model="currentSoundPage"
                :page="currentSoundPage"
                total-visible="10"
              ></v-pagination>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
      <v-card v-else>
        <v-card-text>Kein Server ausgewählt</v-card-text>
      </v-card>
    </v-col>
    <v-col v-else cols="9"></v-col>
  </v-row>
</template>
<script>
import { mapGetters, mapActions } from "vuex";
import getColors from "get-image-colors";
import chroma from "chroma-js";
import axios from "axios";
// import * as Vibrant from "node-vibrant";

import SoundListTile from "../components/SoundListTile";

let ipcRenderer;
if (process.env.VUE_APP_ELECTRON_ENV) {
  ipcRenderer = require("electron").ipcRenderer;
}

export default {
  components: {
    "sound-list-tile": SoundListTile
  },
  created() {
    if (!this.guilds || this.guilds.length === 0) {
      this.reload();
      // this.addSoundHotkeys(this.activeGuild.sounds)
      let lastGuild;
      if (process.env.VUE_APP_ELECTRON_ENV) {
        lastGuild = ipcRenderer.sendSync("get-last-selected-guild");
      }
      if (lastGuild) {
        this.slide = lastGuild;
      }
    }
  },
  ...(process.env.VUE_APP_ELECTRON_ENV && {
    beforeDestroy() {
      // this.removeSoundHotkeys(this.activeGuild.sounds)
    }
  }),
  watch: {
    ...(process.env.VUE_APP_ELECTRON_ENV && {
      activeGuild: {
        immediate: true,
        deep: true,
        handler(to, from) {
          const toSounds = to && to.sounds ? to.sounds : [];
          const fromSounds = from && from.sounds ? from.sounds : [];

          let remove = fromSounds.filter(x => !toSounds.includes(x));
          let add = toSounds.filter(x => !fromSounds.includes(x));

          this.removeSoundHotkeys(remove);
          this.addSoundHotkeys(add);
        }
      }
    }),
    $route: {
      immediate: true,
      handler(to) {
        this.activeGuild = { id: to.query.guild };
        if (process.env.VUE_APP_ELECTRON_ENV) {
          ipcRenderer.send("last-selected-guild", to.query.guild);
        }
      }
    },
    paginationLength(to) {
      if (to < this.currentSoundPage) {
        this.currentSoundPage = Math.max(1, to);
      }
    },
    guilds: {
      immediate: true,
      handler(newVal) {
        if (!newVal) {
          return;
        }
        this.activeGuild = this.activeGuild || newVal[0];
        for (const guild of newVal) {
          if (!guild.icon) {
            continue;
          }
          getColors(guild.icon).then(colors => {
            let first = chroma(
              colors[0]._rgb[0],
              colors[0]._rgb[1],
              colors[0]._rgb[2]
            );
            let second;
            let distance = 0;

            for (const x of colors) {
              const xChroma = chroma(x._rgb[0], x._rgb[1], x._rgb[2]);
              const contrast = chroma.contrast(first.hex(), xChroma.hex());
              if (contrast > distance && contrast >= 2) {
                second = xChroma;
                distance = contrast;
              }
            }

            if (!second) {
              first = chroma("black");
              second = chroma("white");
            } else if (first.luminance() > second.luminance()) {
              const tmp = first;
              first = second;
              second = tmp;
            }

            this.$set(this.guildColors, guild.id, {
              first: first.hex(),
              second: second.hex(),
              darkFirst: first.darken().hex()
            });
            // tmpColors[guild.id] = { first, second };
          });
        }
      }
    }
  },
  methods: {
    ...mapActions(["fetchGuilds"]),
    ...(process.env.VUE_APP_ELECTRON_ENV && {
      addSoundHotkeys(add) {
        add.forEach(x => {
          ipcRenderer.on(`shortcut-triggered-${x.id}`, async (event, sound) => {
            axios
              .all(
                axios.get(
                  `${process.env.VUE_APP_API_BASE_URL}/api/sounds/play`,
                  {
                    params: {
                      id: sound.id,
                      block: false
                    },
                    timeout: 40000
                  }
                )
              )
              .catch(e => {
                if (e.response) {
                  switch (e.response.status) {
                    case 429:
                      this.$toast.error(
                        "Du musst kurz warten, bevor du weitere Befehle senden kannst",
                        {
                          dismissable: true,
                          queueable: true
                        }
                      );
                      break;
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
              .then(e => {
                console.log("sound played", e);
              });
          });
          ipcRenderer.send("add-sound-listener", x);
        });
      },
      removeSoundHotkeys(remove) {
        remove.forEach(x => {
          ipcRenderer.removeAllListeners(`shortcut-triggered-${x.id}`);
          ipcRenderer.send("remove-sound-listener", x);
        });
      }
    }),
    reload() {
      this.fetchingGuilds = true;
      this.fetchGuilds().finally(() => {
        this.fetchingGuilds = false;
      });
    },
    recordingStateChange(value) {
      if (value) {
        ipcRenderer.send("unlisten-all-sounds");
      } else {
        ipcRenderer.send("listen-all-sounds", this.activeGuild.sounds);
      }
    },
    soundJoinValueChanged(sound, newVal) {
      if (newVal) {
        this.$set(this.activeGuild, "joinSound", sound.id);
      } else {
        this.$delete(this.activeGuild, "joinSound");
      }
    },
    getPalette(id) {
      return this.guildColors[id] || { first: "#f4f4f4", second: "black" };
    },
    closeUploadSoundDialog() {
      this.addSoundDialog = false;
      this.$refs.addSoundForm.reset();
    },
    submitUploadSoundForm() {
      if (!this.$refs.addSoundForm.validate()) {
        return;
      }
      console.log("file", this.addSoundFormData.file.name);
      let formData = new FormData();
      formData.append("command", this.addSoundFormData.command);
      formData.append("description", this.addSoundFormData.description);
      formData.append("guild", this.activeGuild.id);
      formData.append(
        "file",
        this.addSoundFormData.file,
        this.addSoundFormData.file.name
      );

      //   for (const key of formData.entries()) {
      //     console.log(key[0], key[1]);
      //   }

      axios
        .post(`${this.baseUrl}/api/sounds/upload`, formData, {
          headers: {
            "Content-Type": "Application/json"
          }
        })
        .then(res => {
          console.log(res);
          this.addSoundDialog = false;
          this.$toast.success(
            `Befehl <b>${this.addSoundFormData.command}</b> erfolgreich gespeichert.`
          );
          this.reload();
          this.$refs.addSoundForm.reset();
        })
        .catch(e => {
          this.$toast.error(
            `Befehl konnte nicht gespeichert werden: <b>${e.response.data.message}</b>`
          );
        });
    }
  },
  computed: {
    ...mapGetters(["guilds"]),
    activeGuild: {
      get() {
        for (const guild of this.guilds) {
          // if (guild.id === this.activeGuildId) {
          if (guild.id === this.slide) {
            return guild;
          }
        }
        return undefined;
      },
      set(value) {
        if (value && value.id) {
          this.slide = value.id;
        }
        // this.activeGuildId = value ? value.id : undefined;
      }
    },
    slide: {
      get() {
        return this.$route.query.guild || this.guilds[0].id;
      },
      set(value) {
        this.$router.push({ query: { guild: value } }).catch(() => {});
      }
    },
    activeGuildCommands() {
      if (!this.activeGuild) {
        return [];
      }
      return this.activeGuild.sounds.map(sound => sound.command);
    },
    filteredSortedActiveGuildSounds() {
      if (!this.activeGuild) {
        return [];
      }
      let sounds = this.activeGuild.sounds;

      let result = sounds;
      // console.log("array", result);
      // console.log("length", result.length);
      if (
        this.soundSearchString &&
        typeof this.soundSearchString === "string" &&
        this.soundSearchString.trim().length >= 2
      ) {
        const searchString = this.soundSearchString.trim().toLowerCase();
        // console.log("filtering", searchString);
        // console.log("with type", searchString);
        result = result.filter(sound => {
          return (
            sound.command.toLowerCase().includes(searchString) ||
            sound.description.toLowerCase().includes(searchString)
          );
        });
        // console.log("after array", result);
        // console.log("after length", result.length);
      }

      let sortMethod = this.soundSortings[this.sortMethod];

      result = sortMethod.sort(result, this.sortDirection);

      return result;
      // TODO
    },
    getPaginatedSounds() {
      let sounds = this.filteredSortedActiveGuildSounds;
      let paginated = sounds.slice(
        (this.currentSoundPage - 1) * this.soundsPerPage,
        this.currentSoundPage * this.soundsPerPage
      );
      return paginated;
    },
    paginationLength() {
      return Math.ceil(
        this.filteredSortedActiveGuildSounds.length / this.soundsPerPage
      );
    },
    filteredSortedGuilds() {
      let result = this.guilds;

      if (
        this.guildSearchString &&
        typeof this.guildSearchString === "string" &&
        this.guildSearchString.trim().length >= 2
      ) {
        const searchString = this.guildSearchString.trim().toLowerCase();
        result = result.filter(guild => {
          return (
            guild.name.toLowerCase().includes(searchString) ||
            guild.name.toLowerCase().includes(searchString)
          );
        });
      }

      return result;
    }
  },
  data() {
    return {
      baseUrl: process.env.VUE_APP_API_BASE_URL,

      palettes: {},

      currentSoundPage: 1,
      soundsPerPage: 16,
      soundSearchString: "",

      soundPlaying: false,

      fetchingGuilds: false,
      guildColors: {},
      activeGuildId: undefined,
      guildSearchString: "",

      addSoundDialog: false,
      addSoundFormData: {
        command: "",
        description: "",
        file: undefined
      },
      sortDirection: 1,
      sortMethod: 0,
      soundSortings: [
        {
          name: "Alphabetisch",
          sort(list, direction) {
            return list.sort(
              (a, b) => direction * a.command.localeCompare(b.command)
            );
          }
        }
      ],

      validationRules: {
        command: [
          v => !!v || "Befehl wird benötigt",
          v => (v && v.length <= 15) || "Darf nicht länger als 15 Zeichen sein",
          v => (v && v.length >= 3) || "Darf nicht kürzer als 3 Zeichen sein",
          v =>
            !this.activeGuildCommands.includes(v) ||
            "Dieser Befehl existiert bereits",
          v =>
            /^[a-zA-Z0-9äÄöÖüÜß]*$/.test(v) ||
            "Der Befehl enthält ungültige Zeichen"
        ],
        description: [
          v => !!v || "Beschreibung wird benötigt",
          v => (v && v.length <= 60) || "Darf nicht länger als 60 Zeichen sein",
          v => (v && v.length >= 3) || "Darf nicht kürzer als 3 Zeichen sein"
        ]
      }
    };
  }
};
</script>
