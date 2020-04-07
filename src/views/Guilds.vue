<template>
  <v-row>
    <v-col cols="3">
      <v-card outlined>
        <v-card-title>Server</v-card-title>
        <v-card-text>
          <v-row dense>
            <v-col v-if="!guilds || guilds.length === 0"
              >Kein Server vorhanden</v-col
            >
            <v-col v-else cols="12">
              <v-card
                v-for="guild in guilds"
                :key="guild.id"
                :class="{ 'mx-3': guild !== activeGuild, 'my-3': true }"
                :elevation="guild === activeGuild ? 5 : 2"
                @click="
                  () => {
                    activeGuild = guild;
                  }
                "
                :color="getPalette(guild.id).first"
              >
                <div class="d-flex flex-no-wrap justify-space-around">
                  <div :style="{ color: getPalette(guild.id).second }">
                    <v-card-title class="headline">
                      {{ guild.name }}
                    </v-card-title>
                    <!-- <v-card-subtitle :style="{ color: getPalette(guild.id).second }">
                      Der Befehl Präfix ist "{{
                      guild.commandPrefix
                      }}"
                    </v-card-subtitle>-->
                  </div>
                  <v-avatar
                    class="ma-3"
                    :size="guild !== activeGuild ? '75' : '85'"
                  >
                    <v-img
                      v-if="guild.icon"
                      :ref="`img-${guild.id}`"
                      :src="guild.icon"
                    ></v-img>
                  </v-avatar>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col v-if="activeGuild" cols="9">
      <v-card outlined>
        <v-card-title>
          <span v-if="!!activeGuild" class="display-1">{{
            activeGuild.name
          }}</span>
          <v-spacer></v-spacer>
          <v-btn large @click="fetchGuilds" class="mr-5" icon>
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
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
                    >Close</v-btn
                  >
                  <v-btn color="blue darken-1" text type="submit"
                    >Speichern</v-btn
                  >
                </v-card-actions>
              </v-form>
            </v-card>
          </v-dialog>
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
          <v-row>
            <v-col
              v-for="(sound, i) in getPaginatedSounds"
              :key="sound.id + i"
              cols="3"
            >
              <sound-list-tile
                :commandPrefix="activeGuild.commandPrefix"
                :sound="sound"
                :editable="sound.creator || activeGuild.owner"
              ></sound-list-tile>
            </v-col>
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
    </v-col>
    <v-col v-else cols="9"></v-col>
  </v-row>
</template>
<script>
import { mapGetters, mapActions } from "vuex";
import getColors from "get-image-colors";
import chroma from "chroma-js";
import axios from "axios";

import SoundListTile from "../components/SoundListTile";

export default {
  components: {
    "sound-list-tile": SoundListTile
  },
  created() {
    console.log("guilds", this.guilds.length);
    if (!this.guilds || this.guilds.length === 0) {
      console.log("fetching guilds");
      this.fetchGuilds("guild created");
    }
  },
  watch: {
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
            let first = colors[0];
            let second;
            let distance = 0;

            for (const x of colors) {
              const contrast = chroma.contrast(first, x);
              if (contrast > distance && contrast >= 2) {
                second = x;
                distance = contrast;
              }
            }

            if (!second) {
              first = chroma("black");
              second = chroma("white");
            }

            // this.guildColors.baum = { first, second };
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

    getPalette(id) {
      return this.guildColors[id] || { first: "white", second: "black" };
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
        .post("/api/sounds/upload", formData, {
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
          this.fetchGuilds("Upload");
        })
        .catch(e => {
          console.log("error");
          this.$toast.error(
            `Befehl konnte nicht gespeichert werden: <b>${e.message}</b>`
          );
        });
      console.log(this.addSoundFormData.file);
    }
  },
  computed: {
    ...mapGetters(["guilds"]),
    activeGuild: {
      get() {
        for (const guild of this.guilds) {
          if (guild.id === this.activeGuildId) {
            return guild;
          }
        }
        return undefined;
      },
      set(value) {
        this.activeGuildId = value ? value.id : undefined;
      }
    },
    activeGuildCommands() {
      if (!this.activeGuild) {
        return [];
      }
      return this.activeGuild.sounds.map(sound => sound.command);
    },
    filteredActiveGuildSounds() {
      if (!this.activeGuild) {
        return [];
      }
      let sounds = this.activeGuild.sounds;

      let result = sounds;

      if (this.soundSearchString.length >= 2) {
        const searchString = this.soundSearchString.trim().toLowerCase();
        result = result.filter(sound => {
          return (
            sound.command.toLowerCase().includes(searchString) ||
            sound.description.toLowerCase().includes(searchString)
          );
        });
      }

      return result;
      // TODO
    },
    getPaginatedSounds() {
      let sounds = this.filteredActiveGuildSounds;
      let paginated = sounds.slice(
        (this.currentSoundPage - 1) * this.soundsPerPage,
        this.currentSoundPage * this.soundsPerPage
      );
      return paginated;
    },
    paginationLength() {
      return Math.ceil(
        this.filteredActiveGuildSounds.length / this.soundsPerPage
      );
    }
  },
  data() {
    return {
      currentSoundPage: 1,
      soundsPerPage: 16,
      guildColors: {},
      soundSearchString: "",
      activeGuildId: undefined,
      soundPlaying: false,
      addSoundDialog: false,
      addSoundFormData: {
        command: "",
        description: "",
        file: undefined
      },
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
