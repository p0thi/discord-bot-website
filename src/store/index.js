import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";
import AuthHandler from "../util/AuthHandler";
import router from "../router";

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    loginStatus: "",
    token: localStorage.getItem("token") || "",
    user: {},
    guilds: []
  },
  getters: {
    isLoggedIn: state => !!state.token,
    authStatus: state => state.loginStatus,
    token: state => state.token,
    user: state => state.user,
    guilds: state => state.guilds
  },
  mutations: {
    auth_request(state) {
      state.loginStatus = "auth";
    },
    login_request(state) {
      state.loginStatus = "login";
    },
    auth_success(state, token, user) {
      state.token = token;
      state.user = user;
      state.loginStatus = "success";
    },
    auth_error(state) {
      state.loginStatus = "error";
    },
    logout(state) {
      state.token = "";
      state.loginStatus = "logout";
    },
    guilds(state, guilds) {
      state.guilds = guilds;
    }
  },
  actions: {
    login({ commit }) {
      return new Promise((resolve, reject) => {
        commit("auth_request");
        let authHandler = new AuthHandler();
        authHandler
          .auth()
          .then(code => {
            commit("login_request");
            authHandler
              .login(code)
              .then(loginResp => {
                let token = loginResp.data.token;
                let user = loginResp.data.user;
                localStorage.setItem("token", token);
                axios.defaults.headers.common["Authorization"] = token;
                console.log(loginResp.data);
                commit("auth_success", token, user);
                resolve(loginResp);
              })
              .catch(err => {
                commit("auth_error");
                localStorage.removeItem("token");
                reject(err);
              });
          })
          .catch(err => {
            commit("auth_error");
            localStorage.removeItem("token");
            reject(err);
          });
      });
    },
    logout({ commit }) {
      return new Promise((resolve, reject) => {
        try {
          localStorage.removeItem("token");
          delete axios.defaults.headers.common["Authorization"];
          router.push("/");
        } catch (e) {
          reject(e);
        }
        commit("logout");
        resolve();
      });
    },
    fetchGuilds({ commit, state }, source) {
      return new Promise((resolve, reject) => {
        if (source) {
          console.log("source", source);
        }
        console.log("fetchGuilds", state.token);
        axios
          .get("/api/guilds/all")
          .then(resp => {
            console.log(resp);
            commit("guilds", resp.data);
            resolve(resp.data);
          })
          .catch(err => {
            reject(err);
          });
      });
    }
  },
  modules: {}
});

if (store.getters.isLoggedIn) {
  axios.defaults.headers.common["Authorization"] = store.getters.token;
}

export default store;
