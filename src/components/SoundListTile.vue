<template>
  <v-card outlined>
    <v-card-title>
      <span>{{ commandPrefix }}</span>
      <span>{{ sound.command }}</span>
      <v-spacer></v-spacer>
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
        <span>
          {{ isJoinSound ? "Join-Sound aktiv" : "Join-Sound nicht aktiv" }}
        </span>
      </v-tooltip>
    </v-card-title>
    <v-card-subtitle>{{ sound.description }}</v-card-subtitle>
    <v-card-actions>
      <v-btn :loading="soundPlaying" @click="playSound" color="success" icon>
        <v-icon large>mdi-play</v-icon>
      </v-btn>

      <v-spacer></v-spacer>
      <div v-if="editable">
        <!-- <v-btn icon>
                      <v-icon>mdi-square-edit-outline</v-icon>
        </v-btn>-->
        <v-btn @click="deleteSound" color="red" icon>
          <v-icon>mdi-delete-forever</v-icon>
        </v-btn>
      </div>
    </v-card-actions>
  </v-card>
</template>
<script>
import axios from "axios";
import { mapActions } from "vuex";

export default {
  //   name: "sound-list-tile",
  methods: {
    ...mapActions(["fetchGuilds"]),
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
              "/api/sounds/joinsound",
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
        .get("/api/sounds/play", {
          params: {
            id: this.sound.id
          },
          timeout: 40000
        })
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
            url: "/api/sounds/delete",
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
              this.fetchGuilds("Sound deletion");
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
  computed: {},
  props: {
    commandPrefix: { type: String, required: true },
    sound: { type: Object, required: true },
    guildId: { type: String, required: true },
    editable: { type: Boolean, default: false },
    isJoinSound: { typpe: Boolean, default: false }
  },
  data() {
    return {
      soundPlaying: false,
      changingJoinSound: false
    };
  }
};
</script>
