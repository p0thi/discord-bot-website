<template>
  <v-card
    class="ma-3 mb-5"
    @click="toggle"
    :style="active ? 'border: 2px solid orange;' : ''"
    :color="palette.first"
    :elevation="active ? 9 : 2"
  >
    <div class="d-flex flex-no-wrap justify-space-around">
      <v-avatar v-if="guild.icon" class="ma-3" size="75">
        <v-img
          v-if="guild.icon"
          :ref="`img-${guild.id}`"
          :src="guild.icon"
        ></v-img>
      </v-avatar>
      <div :style="{ color: palette.second }">
        <v-card-title class="headline">{{ guild.name }}</v-card-title>
        <v-card-subtitle :style="{ color: palette.second }">
          <div>{{ guild.sounds }} sounds available</div>
          <div class="body-2 font-weight-thin">
            <span>Command prefix:</span>
            <span class="font-weight-bold ml-2">{{ guild.commandPrefix }}</span>
          </div>
        </v-card-subtitle>
      </div>
      <div class="d-flex flex-column">
        <v-btn
          @click="toggleFavourite"
          :color="palette.second"
          :loading="favouriteLoading"
          icon
        >
          <v-icon>{{ isFavourite ? "mdi-star" : "mdi-star-outline" }}</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
        <v-dialog v-if="guild.editable" v-model="settingsDialog" width="400px">
          <template v-slot:activator="{ on }">
            <v-btn
              v-on="on"
              :color="palette.second"
              :loading="settingsLoading"
              icon
            >
              <v-icon>mdi-cogs</v-icon>
            </v-btn>
          </template>

          <v-card>
            <v-card-title>Settings: {{ guild.name }}</v-card-title>
            <v-form ref="settingsForm">
              <v-card-text>
                <v-select
                  v-model="commandPrefix"
                  label="Command prefix"
                  persistent-hint
                  hint="Character used to begin commands in discord chat"
                  :items="validPrefixes"
                  required
                  dense
                ></v-select>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn @click="abortSettings" color="red" text>Cancel</v-btn>
                <v-btn @click="saveSettings" text>Save</v-btn>
              </v-card-actions>
            </v-form>
          </v-card>
        </v-dialog>
      </div>
    </div>
  </v-card>
</template>
<script>
import { mapGetters, mapActions } from "vuex";
import axios from "axios";

export default {
  name: "guild-list-tile",
  methods: {
    ...mapActions(["fetchUser", "fetchGuilds"]),
    abortSettings() {
      // this.$refs.settingsForm.reset();
      this.settingsDialog = false;
    },
    saveSettings() {
      this.settingsLoading = true;
      axios
        .post(
          `${process.env.VUE_APP_API_BASE_URL}/api/guilds/settings/${this.guild.id}`,
          {
            commandPrefix: this.commandPrefix,
          }
        )
        .then((resp) => {
          this.commandPrefix = resp.data.data.commandPrefix;
          this.fetchGuilds();
        })
        .catch((err) => {
          this.$toast.error(
            `Settings could not be saved: ${err.response.data.message}`,
            {
              dismissable: true,
            }
          );
        })
        .finally(() => {
          this.$refs.settingsForm.reset();
          this.settingsLoading = false;
          this.settingsDialog = false;
        });
    },
    toggleFavourite() {
      this.favouriteLoading = true;
      const method = this.isFavourite ? "remove" : "add";
      axios
        .post(
          `${process.env.VUE_APP_API_BASE_URL}/api/guilds/favourite/${method}`,
          { guild: this.guild.id }
        )
        .then(() => {
          switch (method) {
            case "remove": {
              this.user.favouriteGuilds.splice(
                this.user.favouriteGuilds.indexOf(this.guild.id),
                1
              );
              break;
            }
            case "add": {
              this.user.favouriteGuilds.push(this.guild.id);
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
    ...mapGetters(["user"]),
    isFavourite() {
      if (!this.user || !this.user.favouriteGuilds) {
        return false;
      }
      return this.user.favouriteGuilds.includes(this.guild.id);
    },
    commandPrefix: {
      get() {
        return this.prefix || this.guild.commandPrefix;
      },
      set(value) {
        this.prefix = value;
      },
    },
  },
  data() {
    return {
      favouriteLoading: false,
      settingsLoading: false,
      settingsDialog: false,
      prefix: undefined,
      rules: {},
      validPrefixes: [
        "!",
        "#",
        "+",
        "-",
        "$",
        "§",
        "%",
        "&",
        "\\",
        "(",
        ")",
        "=",
        "?",
        ".",
        ",",
        "|",
        "[",
        "]",
        "^",
        "€",
      ],
    };
  },
  props: {
    guild: { type: Object, required: true },
    palette: { type: Object, required: true },
    active: { type: Boolean, default: false },
    toggle: { type: Function, required: true },
  },
};
</script>
