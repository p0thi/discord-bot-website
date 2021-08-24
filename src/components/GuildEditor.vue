<template>
  <v-card height="85vh">
    <v-card-title>
      <v-app-bar flat color="rgba(0,0,0,0)">
        <v-toolbar-title>Settings for {{ guild.name }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn @click="close" icon>
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-app-bar>
    </v-card-title>
    <v-card-text>
      <v-row v-if="canManageGroups">
        <v-col cols="12" order="0">
          <h4>Permission Groups</h4>
        </v-col>
        <v-col class="pl-0" cols="12" lg="5" order-lg="last">
          <div class="px-5 py-1">
            <v-btn color="primary" outlined @click="selectedGroup = {}"
              >Create new Group</v-btn
            >
          </div>
          <div
            v-if="!!selectedGroup"
            :class="{ 'selected-item': !!selectedGroup._id }"
            class="pa-5"
          >
            <h2>
              {{ selectedGroup._id ? "Edit" : "Create" }} Permission Group
              {{ selectedGroup._id ? `"${selectedGroup.name}"` : "" }}
            </h2>
            <v-form ref="permission_group_form">
              <v-text-field
                label="Name"
                v-model="currentGroupName"
                required
                :rules="[(v) => !!v || 'Name is required.']"
              ></v-text-field>
              <v-row>
                <v-col
                  ><v-text-field
                    v-model="currentMaxSounds"
                    label="Max Sounds Per User"
                    hint="User will use the highest amount of all their groups"
                    type="number"
                    min="0"
                    :max="guild.maxSounds"
                  ></v-text-field>
                  <span class="caption"
                    >Server limit of total sounds: {{ guild.maxSounds }}</span
                  >
                </v-col>
                <v-col
                  ><v-text-field
                    v-model="currentMaxSoundDuration"
                    label="Max Duration"
                    hint="User will use the highest amount of all their groups"
                    type="number"
                    min="0"
                    :max="guild.maxSoundDuration"
                    suffix="seconds"
                  ></v-text-field>
                  <span class="caption"
                    >Server wide limit for sound duration:
                    {{ guild.maxSoundDuration }} seconds</span
                  >
                </v-col>
              </v-row>
              <h3>Permissions</h3>
              <v-row>
                <v-col cols="12">
                  <div>{{ permissions.length }}</div>
                  <v-autocomplete
                    v-model="currentGroupPermissions"
                    :items="availablePermissions"
                    multiple
                    chips
                    dense
                    item-text="[1]"
                    item-value="[0]"
                  >
                    <template v-slot:selection="data">
                      <v-chip
                        :key="data.item[0]"
                        small
                        close
                        class="my-1"
                        v-bind="data.attrs"
                        :input-value="data.selected"
                        color
                        :disabled="data.disabled"
                        @click:close="data.parent.selectItem(data.item)"
                      >
                        {{ data.item[0] }}
                      </v-chip>
                    </template>
                    <template v-slot:item="data">
                      <template>
                        <v-list-item-content>
                          <v-list-item-title
                            v-html="data.item[0]"
                          ></v-list-item-title>
                          <v-list-item-subtitle
                            v-html="data.item[1]"
                          ></v-list-item-subtitle>
                        </v-list-item-content>
                      </template>
                    </template>
                  </v-autocomplete>
                </v-col>
              </v-row>
              <h3>Roles</h3>
              <v-row>
                <v-col>
                  <v-autocomplete
                    v-model="currentGroupRoles"
                    :items="availableRoles"
                    multiple
                    chips
                    dense
                    item-text="name"
                    item-value="id"
                  >
                    <template v-slot:selection="data">
                      <v-chip
                        :key="data.item.name"
                        small
                        close
                        class="my-1"
                        v-bind="data.attrs"
                        :input-value="data.selected"
                        :disabled="data.disabled"
                        @click:close="data.parent.selectItem(data.item)"
                        color="#444444"
                        :text-color="
                          data.item.hexColor === '#000000'
                            ? '#ffffff'
                            : data.item.hexColor
                        "
                      >
                        {{ data.item.name }}
                      </v-chip>
                    </template>
                    <template v-slot:item="data">
                      <template>
                        <v-list-item-content>
                          <v-list-item-title
                            class="h6"
                            :style="`color: ${data.item.hexColor}`"
                            v-html="data.item.name"
                          ></v-list-item-title>
                          <v-list-item-subtitle
                            v-html="data.item.id"
                          ></v-list-item-subtitle>
                        </v-list-item-content>
                      </template>
                    </template>
                  </v-autocomplete>
                  <v-btn
                    @click="
                      !!selectedGroup._id
                        ? editPermissionGroup()
                        : createPermissionGroup()
                    "
                    text
                    >Save</v-btn
                  >
                  <v-btn
                    v-if="!!selectedGroup._id"
                    @click="deleteGroup"
                    color="red"
                    text
                    >Delete Group</v-btn
                  >
                </v-col>
              </v-row>
            </v-form>
          </div>
          <div v-else class="pa-5 text-center">
            Please select a group on the left to edit or create a new one
          </div>
        </v-col>
        <v-col class="pr-0" cols="12" lg="7" order="2">
          <div v-if="!!permissionGroups">
            <v-simple-table>
              <template>
                <thead>
                  <tr>
                    <th class="text-left">Name</th>
                    <th class="text-left">Max Sounds</th>
                    <th class="text-left">Max Duration</th>
                    <th class="text-left">Roles</th>
                    <th class="text-left">Permissions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(item, i) in permissionGroups"
                    :key="`group-${i}`"
                    @click="selectedGroup = item"
                    :class="{
                      'selected-item':
                        !!selectedGroup && selectedGroup.id === item.id,
                    }"
                  >
                    <td>
                      <b>{{ item.name }}</b>
                    </td>
                    <td>{{ item.maxSoundsPerUser }}</td>
                    <td>{{ item.maxSoundDuration }} seconds</td>
                    <td>
                      <v-chip
                        outlined
                        small
                        class="ma-1"
                        v-for="role in item.discordRoles"
                        :key="`${i}-${role}`"
                        :style="`color: ${
                          guild.roles.find((r) => r.id === role).hexColor
                        }`"
                        >{{
                          guild.roles.find((r) => r.id === role).name
                        }}</v-chip
                      >
                    </td>
                    <td>
                      <v-chip
                        class="ma-1"
                        small
                        color="primary"
                        outlined
                        v-for="permission in item.permissions"
                        :key="`${i}-${permission}`"
                        >{{ permission }}</v-chip
                      >
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
            <div
              v-if="permissionGroups.length === 0"
              class="my-5 d-flex justify-center"
            >
              <div>No groups available</div>
            </div>
          </div>
          <div v-else>
            <v-progress-circular indeterminate></v-progress-circular>
          </div>
        </v-col>
        <v-col cols="12">
          <div class="my-5"></div>
          <v-divider></v-divider>
          <div class="my-5"></div>
        </v-col>
      </v-row>
      <v-row v-if="canManageGuildSettings" justify="center">
        <v-col cols="12">
          <h4>Command Prefix</h4>
          <div class="my-3"></div>
        </v-col>
        <v-col cols="6" cols-lg="12">
          <v-select
            v-model="commandPrefix"
            label="Command prefix"
            persistent-hint
            hint="Character used to begin some commands in discord chat"
            :items="validPrefixes"
            required
            dense
          ></v-select>
          <v-btn @click="saveSettings" outlined class="my-3">
            Save Prefix
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import axios from "axios";
import { mapActions, mapGetters } from "vuex";

export default {
  name: "guild-editor",
  watch: {
    selectedGroup: {
      handler() {
        this.changedSettings = {};
      },
    },
  },
  mounted() {
    this.fetchGroups();
  },
  methods: {
    ...mapActions(["fetchGuilds"]),
    close() {
      this.$emit("close");
    },
    fetchGroups() {
      axios
        .get(
          `${
            process.env.VUE_APP_API_BASE_URL ||
            `${window.location.protocol}//${window.location.host}`
          }/api/permissions/group/all/${this.guild.id}`
        )
        .then((res) => {
          console.log(res.data.data);
          this.permissionGroups = res.data.data;
        });
    },
    deleteGroup() {
      this.$confirm("Really delete this group FINALLY?", {
        buttonTrueText: "Yes",
        buttonFalseText: "No",
      }).then((res) => {
        if (res) {
          axios
            .delete(
              `${
                process.env.VUE_APP_API_BASE_URL ||
                `${window.location.protocol}//${window.location.host}`
              }/api/permissions/group/delete/${this.guild.id}/${
                this.selectedGroup._id
              }`
            )
            .then((res) => {
              console.log(res);
              this.permissionGroups = this.permissionGroups.filter(
                (g) => g._id !== this.selectedGroup._id
              );
              this.$toast.success(`Group deleted: ${this.selectedGroup.name}.`);
              this.fetchGroups();
              this.selectedGroup = undefined;
            })
            .catch((e) => {
              console.error(e);
              this.$toast.error(
                `Group could not be deleted: ${e.response.data.message}`,
                {
                  dismissable: true,
                }
              );
            });
        }
      });
    },
    saveSettings() {
      const prefix = this.changedSettings?.commandPrefix;

      if (!prefix) {
        return;
      }
      this.settingsLoading = true;
      axios
        .post(
          `${
            process.env.VUE_APP_API_BASE_URL ||
            `${window.location.protocol}//${window.location.host}`
          }/api/guilds/settings/${this.guild.id}`,
          {
            commandPrefix: prefix,
          }
        )
        .then((resp) => {
          this.commandPrefix = resp.data.data.commandPrefix;
          this.$toast.success(`Prefix saved: ${prefix}.`);
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
          this.settingsLoading = false;
          this.settingsDialog = false;
        });
    },
    validateForm() {
      return this.$refs.permission_group_form.validate();
    },
    createPermissionGroup() {
      if (!this.validateForm()) {
        return;
      }

      const data = this.changedSettings?.groups?.new;
      if (!data) {
        return;
      }
      this.settingsLoading = true;
      axios
        .post(
          `${
            process.env.VUE_APP_API_BASE_URL ||
            `${window.location.protocol}//${window.location.host}`
          }/api/permissions/group/create`,
          { data, guild: this.guild.id }
        )
        .then((resp) => {
          console.log(resp);
          this.$toast.success(`Permission group created: ${data.name}.`);
          this.fetchGroups();
          this.fetchGuilds();
        })
        .catch((e) => {
          console.error(e);
          this.$toast.error(
            `Settings could not be saved: ${e.response.data.message}`,
            {
              dismissable: true,
            }
          );
        })
        .finally(() => (this.settingsLoading = false));
    },
    editPermissionGroup() {
      if (!this.validateForm()) {
        return;
      }

      console.log("EDITING");

      const data = this.changedSettings?.groups;

      if (!data) {
        return;
      }
      const [key, group] = Object.entries(data)[0];

      this.settingsLoading = true;
      axios
        .patch(
          `${
            process.env.VUE_APP_API_BASE_URL ||
            `${window.location.protocol}//${window.location.host}`
          }/api/permissions/group/edit/${this.guild.id}/${key}`,
          group
        )
        .then((res) => {
          console.log("res", res.data.data);
          this.$toast.success(`Group edited: ${res.data.data.name}.`);
          const oldIndex = this.permissionGroups
            .map((g) => g._id)
            .indexOf(res.data.data._id);
          if (oldIndex !== -1) {
            this.permissionGroups[oldIndex] = res.data.data;
          }
          this.fetchGroups();
          this.fetchGuilds();
        })
        .catch((e) => {
          console.error(e);
          this.$toast.error(
            `Settings could not be saved: ${e.response.data.message}`,
            {
              dismissable: true,
            }
          );
        })
        .finally(() => (this.settingsLoading = false));
    },
  },
  computed: {
    ...mapGetters(["permissions"]),
    commandPrefix: {
      get() {
        return this.changedSettings.commandPrefix || this.guild.commandPrefix;
      },
      set(value) {
        this.changedSettings.commandPrefix = value;
      },
    },
    currentGroupName: {
      get() {
        if (!this.selectedGroup) return [];
        return (
          (this.changedSettings.groups &&
            this.changedSettings.groups[this.selectedGroupId] &&
            this.changedSettings.groups[this.selectedGroupId].name) ||
          this.selectedGroup.name
        );
      },
      set(value) {
        if (!this.changedSettings.groups) {
          this.changedSettings.groups = {};
        }
        if (!this.changedSettings.groups[this.selectedGroupId]) {
          this.changedSettings.groups[this.selectedGroupId] = {};
        }
        this.changedSettings.groups[this.selectedGroupId].name = value;
      },
    },
    currentGroupPermissions: {
      get() {
        if (!this.selectedGroup) return [];
        return (
          (this.changedSettings.groups &&
            this.changedSettings.groups[this.selectedGroupId] &&
            this.changedSettings.groups[this.selectedGroupId].permissions &&
            this.changedSettings.permissions) ||
          this.availablePermissions.filter((p) =>
            this.selectedGroup?.permissions?.includes(p[0])
          )
        );
      },
      set(value) {
        if (!this.changedSettings.groups) {
          this.changedSettings.groups = {};
        }
        if (!this.changedSettings.groups[this.selectedGroupId]) {
          this.changedSettings.groups[this.selectedGroupId] = {};
        }
        this.changedSettings.groups[this.selectedGroupId].permissions = value;
      },
    },
    availablePermissions() {
      return Object.entries(this.permissions);
    },
    currentGroupRoles: {
      get() {
        if (!this.selectedGroup) return [];
        return (
          (this.changedSettings.groups &&
            this.changedSettings.groups[this.selectedGroupId] &&
            this.changedSettings.groups[this.selectedGroupId].discordRoles) ||
          this.availableRoles.filter((p) =>
            this.selectedGroup?.discordRoles?.includes(p.id)
          )
        );
      },
      set(value) {
        if (!this.changedSettings.groups) {
          this.changedSettings.groups = {};
        }
        if (!this.changedSettings.groups[this.selectedGroupId]) {
          this.changedSettings.groups[this.selectedGroupId] = {};
        }
        this.changedSettings.groups[this.selectedGroupId].discordRoles = value;
      },
    },
    selectedGroupId() {
      return this.selectedGroup?._id || "new";
    },
    availableRoles() {
      return this.guild.roles;
    },
    currentMaxSounds: {
      get() {
        if (!this.selectedGroup) return 0;
        return (
          this.changedSettings.maxSoundsPerUser ||
          this.selectedGroup.maxSoundsPerUser ||
          0
        );
      },
      set(value) {
        if (!this.changedSettings.groups) {
          this.changedSettings.groups = {};
        }
        if (!this.changedSettings.groups[this.selectedGroupId]) {
          this.changedSettings.groups[this.selectedGroupId] = {};
        }
        this.changedSettings.groups[this.selectedGroupId].maxSoundsPerUser =
          value;
      },
    },
    currentMaxSoundDuration: {
      get() {
        if (!this.selectedGroup) return 0;
        return (
          this.changedSettings.maxSoundDuration ||
          this.selectedGroup.maxSoundDuration ||
          0
        );
      },
      set(value) {
        if (!this.changedSettings.groups) {
          this.changedSettings.groups = {};
        }
        if (!this.changedSettings.groups[this.selectedGroupId]) {
          this.changedSettings.groups[this.selectedGroupId] = {};
        }
        this.changedSettings.groups[this.selectedGroupId].maxSoundDuration =
          value;
      },
    },
    canManageGroups() {
      return (
        this.guild.userPermissions.includes("MANAGE_GROUPS") &&
        !this.guild.banned
      );
    },
    canManageGuildSettings() {
      return (
        this.guild.userPermissions.includes("MANAGE_GUILD_SETTINGS") &&
        !this.guild.banned
      );
    },
  },
  props: {
    guild: { type: Object, required: true },
  },
  data() {
    return {
      changedSettings: {},
      selectedGroup: undefined,
      permissionGroups: undefined,
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
};
</script>

<style scoped lang="scss">
.selected-item {
  background-color: #f5f5f5;
}
.block-setting {
  display: block;
}
</style>
