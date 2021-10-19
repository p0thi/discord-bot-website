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
        <v-card-title class="headline">{{
          guild.name || "Unknown Name"
        }}</v-card-title>
        <v-card-subtitle :style="{ color: palette.second }">
          <div>{{ guild.sounds }} sounds (max {{ guild.maxSounds }})</div>
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
        <v-btn
          v-if="
            !guild.banned &&
            (canManageGroups || canManageGuildSettings || guild.owner)
          "
          @click="settingsDialog = !settingsDialog"
          :color="palette.second"
          :loading="settingsLoading"
          icon
        >
          <v-icon>mdi-cogs</v-icon>
        </v-btn>
        <v-bottom-sheet
          v-if="
            !guild.banned &&
            (canManageGroups || canManageGuildSettings || guild.owner)
          "
          v-model="settingsDialog"
          inset
          scrollable
          persistent
        >
          <guild-editor
            v-if="settingsDialog"
            :guild="guild"
            @close="settingsDialog = false"
          ></guild-editor>
        </v-bottom-sheet>
      </div>
    </div>
  </v-card>
</template>
<script>
import { mapGetters, mapActions } from "vuex";
import axios from "axios";
import GuildEditor from "./GuildEditor";

export default {
  name: "guild-list-tile",
  components: {
    "guild-editor": GuildEditor,
  },
  methods: {
    ...mapActions(["fetchUser", "fetchGuilds"]),
    abortSettings() {
      // this.$refs.settingsForm.reset();
      this.settingsDialog = false;
    },
    toggleFavourite() {
      this.favouriteLoading = true;
      const method = this.isFavourite ? "remove" : "add";
      axios
        .post(
          `${
            process.env.VUE_APP_API_BASE_URL ||
            `${window.location.protocol}//${window.location.host}`
          }/api/guilds/favourite/${method}`,
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
      return this.user.favouriteGuilds?.includes(this.guild.id);
    },
    canManageGroups() {
      return (
        this.guild.userPermissions?.includes("MANAGE_GROUPS") &&
        !this.guild.banned
      );
    },
    canManageGuildSettings() {
      return (
        this.guild.userPermissions?.includes("MANAGE_GUILD_SETTINGS") &&
        !this.guild.banned
      );
    },
  },
  data() {
    return {
      favouriteLoading: false,
      settingsLoading: false,
      settingsDialog: false,
      rules: {},
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
