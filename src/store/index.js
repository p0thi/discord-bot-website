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
    auth_success(state, token) {
      state.token = token;
      state.loginStatus = "success";
    },
    auth_error(state) {
      state.loginStatus = "error";
    },
    logout(state) {
      state.token = "";
      state.loginStatus = "logout";
      state.user = {};
    },
    guilds(state, guilds) {
      state.guilds = guilds;
    },
    setUser(state, user) {
      state.user = user;
    }
  },
  actions: {
    login({ commit, dispatch }) {
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
                localStorage.setItem("token", token);
                axios.defaults.headers.common["Authorization"] = token;
                commit("auth_success", token);
                const redirect = router.history.current.query.redirect
                  ? decodeURIComponent(router.history.current.query.redirect)
                  : "/";
                console.log("redirecting", redirect);
                router.push(redirect);
                dispatch("fetchUser");
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
    fetchGuilds({ commit }, source) {
      return new Promise((resolve, reject) => {
        if (source) {
          console.log("source", source);
        }
        axios
          .get(`${process.env.VUE_APP_API_BASE_URL}/api/guilds/all`)
          .then(resp => {
            console.log(resp);
            commit("guilds", resp.data);
            resolve(resp.data);
          })
          .catch(err => {
            reject(err);
          });
      });
    },
    fetchUser({ commit }) {
      return new Promise((resolve, reject) => {
        console.log();
        axios
          .get(`${process.env.VUE_APP_API_BASE_URL}/api/user/self`)
          .then(resp => {
            commit("setUser", resp.data);
            console.log("user fetched", resp.data);
            resolve();
          })
          .catch(e => {
            reject(e);
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
