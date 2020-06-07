import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)
export const store = new Vuex.Store(
    {
        state: {
            loading: false,
            errorMessage: "",
            title: "JSON Beautifier"
        },

        mutations: {
            setLoading(state, payload) {
                state.loading = payload;
            },
            setErrorMessage(state, payload) {
                state.errorMessage = payload;
            }
        },

        actions: {
            setLoading({ commit }, payload) {
                commit('setLoading', payload)
            },
            setErrorMessage({ commit }, payload) {
                commit('setErrorMessage', payload)
            }
        },

        getters: {
            loading(state) {
                return state.loading
            },
            errorMessage(state) {
                return state.errorMessage
            },
            title(state) {
                return state.title
            },
        }
    }
);