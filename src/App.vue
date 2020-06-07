<template>
  <div id="app">
    <Header />
    <JsonBeautify />
    <Footer />
    <RingLoader :loading="$store.getters.loading"></RingLoader>
    <ErrorDialog />
  </div>
</template>

<script>
import JsonBeautify from "./components/JsonBeautify.vue";
import Header from "./components/Header.vue";
import Footer from "./components/Footer.vue";
import RingLoader from "vue-spinner/src/RingLoader.vue";
import ErrorDialog from "./components/ErrorDialog.vue";
export default {
  name: "App",
  components: {
    JsonBeautify,
    Header,
    Footer,
    RingLoader,
    ErrorDialog
  }
};
</script>

<style>
.v-spinner {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  overflow: hidden;
}
</style>
