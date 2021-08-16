<template>
  <v-row>
    <v-col cols="12">
      <v-card outlined>
        <v-card-title>
          <span>Select server</span>
          <v-spacer></v-spacer>
          <v-text-field
            v-model="guildSearchString"
            flat
            hide-details
            label="Search"
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
              Loading...
              <v-progress-linear
                indeterminate
                color="primary"
              ></v-progress-linear>
            </span>
            <span v-else-if="filteredSortedGuilds.length === 0"
              >No server found for this search query</span
            >
            <span v-else>No servers available or loaded</span>
          </v-col>
          <v-slide-group v-else v-model="slide" show-arrows mandatory>
            <v-slide-item
              v-for="guild in filteredSortedGuilds"
              :key="guild.id"
              v-slot:default="{ active, toggle }"
              :value="guild.id"
            >
              <guild-list-tile
                :toggle="toggle"
                :guild="guild"
                :palette="getPalette(guild.id)"
                :active="active"
              ></guild-list-tile>
            </v-slide-item>
          </v-slide-group>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col v-if="activeGuild" cols="12">
      <v-card v-if="filteredSortedGuilds.length > 0" outlined>
        <v-card-title class="sounds-title">
          <span>
            <v-avatar
              :color="!activeGuild.icon ? 'primary' : 'none'"
              class="mr-3"
              size="50"
            >
              <v-img v-if="activeGuild.icon" :src="activeGuild.icon"></v-img>
              <span style="color: white" v-else>{{
                activeGuild.name.toUpperCase().charAt(0)
              }}</span>
            </v-avatar>
          </span>
          <span v-if="!!activeGuild" class="display-1">
            {{ activeGuild.name }}
          </span>
          <v-spacer></v-spacer>

          <v-dialog v-model="addSoundDialog" persistent max-width="600px">
            <template v-slot:activator="{ on }">
              <v-btn color="primary" dark v-on="on">
                Add sound
                <v-icon>mdi-plus</v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-form
                ref="addSoundForm"
                @submit.prevent="submitUploadSoundForm"
              >
                <v-card-title>
                  <span class="headline">Add new sound</span>
                </v-card-title>
                <v-card-text>
                  <v-text-field
                    counter
                    class="mb-5"
                    :rules="validationRules.command"
                    placeholder="Command"
                    v-model="addSoundFormData.command"
                    :hint="`Write command without ${activeGuild.commandPrefix} at the beginning`"
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
                    placeholder="Description of the sound"
                    required
                  ></v-textarea>
                  <v-file-input
                    placeholder="Select sound file"
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
                    >Close</v-btn
                  >
                  <v-btn color="blue darken-1" text type="submit">Save</v-btn>
                </v-card-actions>
              </v-form>
            </v-card>
          </v-dialog>
          <v-spacer></v-spacer>

          <v-menu :close-on-content-click="false">
            <template v-slot:activator="{ on: menu }">
              <v-badge
                :value="filterMethods.length > 0"
                overlap
                left
                :content="filterMethods.length"
              >
                <v-tooltip bottom>
                  <template v-slot:activator="{ on: tooltip }">
                    <v-btn icon v-on="{ ...menu, ...tooltip }">
                      <v-icon>mdi-filter-menu</v-icon>
                    </v-btn>
                  </template>
                  <span>Filter sounds</span>
                </v-tooltip>
              </v-badge>
            </template>
            <v-card>
              <v-card-title>
                <span>Filter</span>
                <span class="ml-auto">{{ filterMethods.length }} selected</span>
              </v-card-title>
              <v-list shaped>
                <v-list-item-group v-model="filterMethods" multiple>
                  <template v-for="(item, i) in soundFilters">
                    <v-list-item :key="`filter-${i}`" :value="i">
                      <template v-slot:default="{ active, toggle }">
                        <v-list-item-content>
                          <v-list-item-title
                            v-text="item.name"
                          ></v-list-item-title>
                          <v-list-item-subtitle
                            v-text="item.description"
                          ></v-list-item-subtitle>
                        </v-list-item-content>
                        <v-list-item-action>
                          <v-checkbox
                            :input-value="active"
                            :true-value="i"
                            @click="toggle"
                          ></v-checkbox>
                        </v-list-item-action>
                      </template>
                    </v-list-item>
                  </template>
                </v-list-item-group>
              </v-list>
            </v-card>
          </v-menu>
          <v-menu :close-on-content-click="false">
            <template v-slot:activator="{ on: menu }">
              <v-tooltip bottom>
                <template v-slot:activator="{ on: tooltip }">
                  <v-btn
                    color="primary"
                    dark
                    v-on="{ ...menu, ...tooltip }"
                    icon
                  >
                    <v-icon>mdi-sort-variant</v-icon>
                  </v-btn>
                </template>
                <span>Sort sounds</span>
              </v-tooltip>
            </template>
            <v-card>
              <v-card-title>
                Order
                <v-btn-toggle
                  class="ml-auto"
                  v-model="sortDirection"
                  mandatory
                  dense
                  tile
                >
                  <v-btn :value="-1" icon>
                    <v-icon>mdi-sort-descending</v-icon>
                  </v-btn>
                  <v-btn :value="1" icon>
                    <v-icon>mdi-sort-ascending</v-icon>
                  </v-btn>
                </v-btn-toggle>
              </v-card-title>
              <v-card-text>
                <v-radio-group v-model="sortMethod">
                  <v-radio
                    v-for="(item, i) in soundSortings"
                    :key="item.name"
                    :label="item.name"
                    :value="i"
                  ></v-radio>
                </v-radio-group>
                <v-checkbox
                  v-model="favouriteSoundsFirst"
                  label="Always show favorites first"
                ></v-checkbox>
              </v-card-text>
            </v-card>
          </v-menu>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn
                :loading="randomPlaying"
                v-on="on"
                icon
                @click="playRandom"
                color="success"
              >
                <v-icon>mdi-clipboard-play-multiple-outline</v-icon>
              </v-btn>
            </template>
            <span>Play random sound</span>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn
                :loading="fetchingGuilds"
                v-on="on"
                large
                @click="reload"
                class="mr-5"
                icon
              >
                <v-icon>mdi-refresh</v-icon>
              </v-btn>
            </template>
            <span>Refresh sounds</span>
          </v-tooltip>

          <v-text-field
            v-model="soundSearchString"
            flat
            hide-details
            label="Search"
            clearable
            prepend-inner-icon="mdi-magnify"
            solo-inverted
          ></v-text-field>
        </v-card-title>
        <v-card-text>
          <div v-if="activeGuild && activeGuildSounds.length > 0">
            <v-row v-if="filteredSortedActiveGuildSounds.length > 0">
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
                  @deleted="reload()"
                  :commandPrefix="activeGuild.commandPrefix"
                  :sound="sound"
                  :guildId="activeGuild.id"
                  :editable="sound.creator || activeGuild.owner"
                  :isJoinSound="activeGuild.joinSound === sound.id"
                >
                  <template v-if="sortMethod === 1" v-slot:date>
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on }">
                        <div v-on="on" class="caption grey--text">
                          {{ getFormatedCreationDate(sound) }}
                        </div>
                      </template>
                      <span>{{ getFormatedCreationDate(sound, true) }}</span>
                    </v-tooltip>
                  </template>
                </sound-list-tile>
              </v-col>
            </v-row>
            <v-row v-else>
              <v-col cols="12"
                >There are no results for these filter settings</v-col
              >
            </v-row>
          </div>
          <v-row v-else-if="fetchingSounds">
            <v-progress-linear
              indeterminate
              color="primary"
            ></v-progress-linear>
          </v-row>
          <v-row v-else>
            <v-col>No sounds available yet</v-col>
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
        <v-card-text>No server selected</v-card-text>
      </v-card>
    </v-col>
    <v-col v-else cols="9"></v-col>
  </v-row>
</template>
<script>
import { mapGetters, mapActions, mapMutations } from "vuex";
import getColors from "get-image-colors";
import chroma from "chroma-js";
import axios from "axios";
import moment from "moment";
// import WaveSurfer from 'wavesurfer.js'
// import * as Vibrant from "node-vibrant";

import SoundListTile from "../components/SoundListTile";
import GuildListTile from "../components/GuildListTile";

let ipcRenderer;
if (process.env.VUE_APP_ELECTRON_ENV) {
  ipcRenderer = require("electron").ipcRenderer;
}

export default {
  components: {
    "sound-list-tile": SoundListTile,
    "guild-list-tile": GuildListTile,
  },
  created() {
    if (!this.guilds || this.guilds.length === 0) {
      this.reload();
      // this.addSoundHotkeys(this.activeGuildSounds)
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
      // this.removeSoundHotkeys(this.activeGuildSounds)
    },
  }),
  watch: {
    ...(process.env.VUE_APP_ELECTRON_ENV && {
      activeGuildSounds: {
        immediate: true,
        deep: true,
        handler(to, from) {
          const toSounds = to || [];
          const fromSounds = from || [];

          let remove = fromSounds.filter((x) => !toSounds.includes(x));
          let add = toSounds.filter((x) => !fromSounds.includes(x));

          this.removeSoundHotkeys(remove);
          this.addSoundHotkeys(add);
        },
      },
    }),
    activeGuild(to) {
      if (!this.sounds[to.id]) {
        this.fetchingSounds = true;
        this.fetchSounds(to.id).finally(() => (this.fetchingSounds = false));
      }
    },
    $route: {
      immediate: true,
      handler(to) {
        this.activeGuild = { id: to.query.guild };
        if (process.env.VUE_APP_ELECTRON_ENV) {
          ipcRenderer.send("last-selected-guild", to.query.guild);
        }
      },
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
          getColors(guild.icon).then((colors) => {
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
              darkFirst: first.darken().hex(),
            });
            // tmpColors[guild.id] = { first, second };
          });
        }
      },
    },
  },
  methods: {
    ...mapActions(["fetchGuilds", "fetchSounds", "fetchUser"]),
    ...mapMutations([
      "setGuildSounds",
      "setFavouriteSoundsFirst",
      "setSortDirection",
      "setSortMethod",
      "setFilterMethods",
    ]),
    ...(process.env.VUE_APP_ELECTRON_ENV && {
      addSoundHotkeys(add) {
        add.forEach((x) => {
          ipcRenderer.on(`shortcut-triggered-${x.id}`, async (event, sound) => {
            axios
              .all(
                axios.get(
                  `${process.env.VUE_APP_API_BASE_URL}/api/sounds/play`,
                  {
                    params: {
                      id: sound.id,
                      block: false,
                    },
                    timeout: 40000,
                  }
                )
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
              .then((e) => {
                console.log("sound played", e);
              });
          });
          ipcRenderer.on(`listening-sound-${x.id}`, (event, data) => {
            if (data) {
              if (!this.listeningSoundIds.includes(x.id)) {
                this.listeningSoundIds.push(x.id);
              }
            } else {
              const index = this.listeningSoundIds.indexOf(x.id);
              if (index >= 0) {
                this.listeningSoundIds.splice(index, 1);
              }
            }
          });
          ipcRenderer.send("add-sound-listener", x);
        });
      },
      removeSoundHotkeys(remove) {
        remove.forEach((x) => {
          ipcRenderer.removeAllListeners(`shortcut-triggered-${x.id}`);
          ipcRenderer.removeAllListeners(`listening-sound-${x.id}`);
          ipcRenderer.send("remove-sound-listener", x);

          const index = this.listeningSoundIds.indexOf(x.id);
          if (index >= 0) {
            this.listeningSoundIds.splice(index, 1);
          }
        });
      },
    }),
    reload() {
      this.fetchingGuilds = true;
      this.fetchingSounds = true;
      let promises = [this.fetchGuilds()];
      if (this.activeGuild) {
        promises.push(this.fetchSounds(this.activeGuild.id));
      }
      Promise.all(promises).finally(() => {
        this.fetchingGuilds = false;
        this.fetchingSounds = false;
      });
    },
    playRandom() {
      if (this.randomPlaying) {
        return;
      }
      this.randomPlaying = true;
      axios
        .get(`${process.env.VUE_APP_API_BASE_URL}/api/sounds/play`, {
          params: {
            id: "random",
            guild: this.activeGuild.id,
            // block: false
          },
          timeout: 40000,
        })
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
          this.randomPlaying = false;
        });
    },
    recordingStateChange(value) {
      if (value) {
        ipcRenderer.send("unlisten-all-sounds");
      } else {
        ipcRenderer.send("listen-all-sounds", this.activeGuildSounds);
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
            "Content-Type": "Application/json",
          },
        })
        .then((res) => {
          console.log(res);
          this.addSoundDialog = false;
          this.$toast.success(
            `Command <b>${this.addSoundFormData.command}</b> saved successfully.`
          );
          this.reload();
          this.$refs.addSoundForm.reset();
        })
        .catch((e) => {
          this.$toast.error(
            `Command could not be saved: <b>${e.response.data.message}</b>`
          );
        });
    },
    getSoundsOfGuild(guildId) {
      const sounds = this.sounds[guildId];
      // if (!sounds) {
      //   this.fetchSounds(guildId);
      // }
      return sounds || [];
    },
    getFormatedCreationDate(sound, long = false) {
      moment.locale("en");
      if (long) {
        return moment(sound.createdAt).format("ddd Do MMMM YYYY - HH:mm");
      } else {
        return moment(sound.createdAt).format("DD. MMMM YYYY");
      }
    },
    isGuildFavourite(guild) {
      if (!this.user || !this.user.favouriteGuilds) {
        return false;
      }
      return this.user.favouriteGuilds.includes(guild.id);
    },
    isSoundFavourite(sound) {
      if (!this.user || !this.user.favouriteSounds) {
        return false;
      }
      return this.user.favouriteSounds.includes(sound.id);
    },
  },
  computed: {
    ...mapGetters([
      "guilds",
      "sounds",
      "user",
      "getSortDirection",
      "getSortMethod",
      "getFavouriteSoundsFirst",
      "getFilterMethods",
    ]),
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
      },
    },
    slide: {
      get() {
        return this.$route.query.guild || this.guilds[0].id;
      },
      set(value) {
        this.$router.push({ query: { guild: value } }).catch(() => {});
      },
    },
    activeGuildSounds() {
      if (!this.activeGuild) {
        return [];
      }
      const guildSounds = this.getSoundsOfGuild(this.activeGuild.id);
      return guildSounds || [];
    },
    activeGuildCommands() {
      if (!this.activeGuild) {
        return [];
      }
      return this.activeGuildSounds.map((sound) => sound.command);
    },
    filteredSortedActiveGuildSounds() {
      if (!this.activeGuild) {
        return [];
      }
      let sounds = this.activeGuildSounds;

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
        result = result.filter((sound) => {
          return (
            sound.command.toLowerCase().includes(searchString) ||
            sound.description.toLowerCase().includes(searchString)
          );
        });
        // console.log("after array", result);
        // console.log("after length", result.length);
      }

      let currentSortMethod =
        this.soundSortings[
          Math.min(this.sortMethod, this.soundSortings.length - 1)
        ];
      result = currentSortMethod.sort(result, this.sortDirection);

      for (const index of this.filterMethods) {
        result = this.soundFilters[index].filter(result, this);
      }

      if (this.favouriteSoundsFirst) {
        let favourites = [];
        let rest = [];
        for (const sound of result) {
          if (this.isSoundFavourite(sound)) favourites.push(sound);
          else rest.push(sound);
        }
        result = favourites.concat(rest);
      }

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
        result = result.filter((guild) => {
          return (
            guild.name.toLowerCase().includes(searchString) ||
            guild.name.toLowerCase().includes(searchString)
          );
        });
      }

      result.sort((a, b) => {
        const aFav = this.isGuildFavourite(a);
        const bFav = this.isGuildFavourite(b);

        if (aFav) {
          if (bFav) return 0;
          else return -1;
        } else {
          if (bFav) return 1;
          else return 0;
        }
      });

      return result;
    },
    favouriteSoundsFirst: {
      get() {
        return this.getFavouriteSoundsFirst;
      },
      set(value) {
        this.setFavouriteSoundsFirst(value);
      },
    },
    sortDirection: {
      get() {
        return this.getSortDirection;
      },
      set(value) {
        this.setSortDirection(value);
      },
    },
    sortMethod: {
      get() {
        return this.getSortMethod;
      },
      set(value) {
        this.setSortMethod(value);
      },
    },
    filterMethods: {
      get() {
        return this.getFilterMethods;
      },
      set(value) {
        this.setFilterMethods(value);
      },
    },
  },
  data() {
    return {
      ...(process.env.VUE_APP_ELECTRON_ENV && {
        listeningSoundIds: [],
      }),
      baseUrl: process.env.VUE_APP_API_BASE_URL,

      palettes: {},

      randomPlaying: false,

      currentSoundPage: 1,
      soundsPerPage: 16,
      soundSearchString: "",

      soundPlaying: false,

      fetchingGuilds: false,
      fetchingSounds: true,
      guildColors: {},
      activeGuildId: undefined,
      guildSearchString: "",

      addSoundDialog: false,
      addSoundFormData: {
        command: "",
        description: "",
        file: undefined,
      },

      // favouriteSoundsFirst: false,
      // sortDirection: 1,
      // sortMethod: 0,
      soundSortings: [
        {
          name: "Alphabetical",
          description: "Sorts the entries in alphabetical order",
          sort(list, direction) {
            return list.sort(
              (a, b) => direction * a.command.localeCompare(b.command)
            );
          },
        },
        {
          name: "Creation Date",
          description: "Sorts the entries by creation date",
          sort(list, direction) {
            return list.sort((a, b) => {
              const aDate = moment(a.createdAt);
              const bDate = moment(b.createdAt);

              const result = aDate > bDate ? 1 : bDate > aDate ? -1 : 0;
              return direction * result;
            });
          },
        },
      ],

      soundFilters: [
        ...(process.env.VUE_APP_ELECTRON_ENV
          ? [
              {
                name: "Hotkeys",
                description: "Show hotkeys only",
                filter(list, myThis) {
                  return list.filter((item) => {
                    return myThis.listeningSoundIds.includes(item.id);
                  });
                },
              },
            ]
          : []),
        {
          name: "Favorites",
          description: "Show only favorites",
          filter(list, myThis) {
            return list.filter((item) => {
              return myThis.isSoundFavourite(item);
            });
          },
        },
        {
          name: "Join-Sound",
          description: "Show only the join sound",
          filter(list, myThis) {
            return list.filter((item) => {
              return item.id === myThis.activeGuild.joinSound;
            });
          },
        },
        {
          name: "Own",
          description: "Show only commands that you have created yourself",
          filter(list) {
            return list.filter((item) => item.creator);
          },
        },
      ],

      validationRules: {
        command: [
          (v) => !!v || "Command required",
          (v) =>
            (v && v.length <= 15) || "Can not be longer than 15 characters",
          (v) => (v && v.length >= 3) || "Can not be shorter than 3 characters",
          (v) =>
            !this.activeGuildCommands.includes(v) || "Command already exists",
          (v) =>
            /^[a-zA-Z0-9äÄöÖüÜß]*$/.test(v) ||
            "The command contains invalid characters",
        ],
        description: [
          (v) => !!v || "Description required",
          (v) =>
            (v && v.length <= 60) || "Can not be longer than 60 characters",
          (v) => (v && v.length >= 3) || "Can not be shorter than 3 characters",
        ],
      },
    };
  },
};
</script>
<style lang="scss">
.sounds-title {
  > * {
    margin: 0.4rem 0;
  }
}
</style>
