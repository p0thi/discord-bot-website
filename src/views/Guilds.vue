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
                :class="{ 'mx-3': guild !== activeGuild }"
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
                    <v-card-title class="headline">{{
                      guild.name
                    }}</v-card-title>
                    <v-card-subtitle
                      :style="{ color: getPalette(guild.id).second }"
                      >Der Befehl Präfix ist "{{
                        guild.commandPrefix
                      }}"</v-card-subtitle
                    >
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
          <span v-if="!!activeGuild">{{ activeGuild.name }}</span>
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
                    :rules="validationRules.command"
                    placeholder="Befehlt"
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
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col v-for="sound in activeGuild.sounds" :key="sound.id" cols="3">
              <v-card tile>
                <v-card-title>
                  <span>{{ activeGuild.commandPrefix }}</span>
                  <span>{{ sound.command }}</span>
                </v-card-title>
                <v-card-subtitle>{{ sound.description }}</v-card-subtitle>
                <v-card-actions>
                  <v-btn
                    :loading="soundPlaying"
                    @click="playSound(sound)"
                    color="success"
                    icon
                  >
                    <v-icon large>mdi-play</v-icon>
                  </v-btn>
                  <v-spacer></v-spacer>
                  <div v-if="sound.creator || activeGuild.owner">
                    <!-- <v-btn icon>
                      <v-icon>mdi-square-edit-outline</v-icon>
                    </v-btn>-->
                    <v-btn @click="deleteSound(sound)" color="red" icon>
                      <v-icon>mdi-delete-forever</v-icon>
                    </v-btn>
                  </div>
                </v-card-actions>
              </v-card>
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

export default {
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
        this.activeGuild = newVal[0];
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
    playSound(sound) {
      this.soundPlaying = true;
      axios
        .get("/api/sounds/play", {
          params: {
            id: sound.id
          }
        })
        .finally(() => {
          this.soundPlaying = false;
        });
    },
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
        .then(res => console.log(res))
        .catch(() => console.log("error"));
      console.log(this.addSoundFormData.file);
    },
    deleteSound(sound) {
      sound + "";
      this.$confirm("Wirklich diesen Sound ENDGÜLTIG löschen?", {
        buttonTrueText: "Ja",
        buttonFalseText: "Nein"
      }).then(res => {
        console.log("res", res);
        if (res) {
          axios({
            url: "/api/sounds/delete",
            method: "DELETE",
            data: {
              sound: sound.id,
              guild: this.activeGuild.id
            }
          }).then(() => {
            console.log("success");
          });
        }
      });
      return;
    }
  },
  computed: {
    ...mapGetters(["guilds"]),
    activeGuildCommands() {
      if (!this.activeGuild) {
        return [];
      }
      return this.activeGuild.sounds.map(sound => sound.command);
    }
  },
  data() {
    return {
      guildColors: {},
      activeGuild: undefined,
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
          v => v.length <= 15 || "Darf nicht länger als 15 Zeichen sein",
          v => v.length >= 3 || "Darf nicht kürzer als 3 Zeichen sein",
          v =>
            !this.activeGuildCommands.includes(v) ||
            "Dieser Befehl existiert bereits",
          v =>
            /^[a-zA-Z0-9äÄöÖüÜß]*$/.test(v) ||
            "Der Befehl enthält ungültige Zeichen"
        ],
        description: [
          v => !!v || "Beschreibung wird benötigt",
          v => v.length <= 60 || "Darf nicht länger als 60 Zeichen sein",
          v => v.length >= 3 || "Darf nicht kürzer als 3 Zeichen sein"
        ]
      }
    };
  }
};
</script>
