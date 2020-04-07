<template>
  <v-card tile>
    <v-card-title>
      <span>{{ commandPrefix }}</span>
      <span>{{ sound.command }}</span>
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
    ...mapActions["fetchGuilds"],
    playSound() {
      this.soundPlaying = true;
      axios
        .get("/api/sounds/play", {
          params: {
            id: this.sound.id
          }
        })
        .catch(e => {
          if (e.response) {
            if (e.response.status === 429) {
              this.$toast.error(
                "Du musst kurz warten, bevor du weitere Befehle senden kannst"
              );
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
        console.log("res", res);
        if (res) {
          axios({
            url: "/api/sounds/delete",
            method: "DELETE",
            data: {
              sound: this.sound.id
            }
          })
            .then(() => {
              console.log("success");
              this.fetchGuilds();
              this.$toast.success(
                `Befehl ${this.sound.command} erfolgreich gelöscht`
              );
            })
            .atch(e => {
              this.$toast.error(
                `Der Befehl konnte nicht gelöscht werden. ${e.data.message}`
              );
            });
        }
      });
      return;
    }
  },
  props: {
    commandPrefix: { type: String, required: true },
    sound: { type: Object, required: true },
    editable: { type: Boolean, default: false }
  },
  data() {
    return {
      soundPlaying: false
    };
  }
};
</script>
