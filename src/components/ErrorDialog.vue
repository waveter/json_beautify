<template>
  <b-modal id="bv-model-error-dialog" hide-footer @hidden="closeErrorDialog">
    <template v-slot:modal-title>Error</template>
    <div class="modal-body">
      <div class="error-icon">
        <i class="fa fa-exclamation-triangle" aria-hidden="true"></i>
      </div>
      <div class="error-message">{{$store.getters.errorMessage}}</div>
    </div>
    <b-button class="close-btn" @click="closeErrorDialog">Close</b-button>
  </b-modal>
</template>
<script>
export default {
  name: "ErrorDialog",
  methods: {
    closeErrorDialog() {
      this.$store.dispatch("setErrorMessage", "");
      this.$bvModal.hide("bv-model-error-dialog");
    }
  },
  created() {
    this.$store.watch(
      state => state.errorMessage,
      value => {
        if (value === "") {
          this.$bvModal.hide("bv-model-error-dialog");
        } else {
          this.$bvModal.show("bv-model-error-dialog");
        }
      }
    );
  }
};
</script>

<style scoped>
.fa-exclamation-triangle {
  color: red;
  font-size: 30px;
}

.close-btn {
  float: right;
}

.modal-body {
  display: flex;
}

.error-icon {
  flex-basis: 55px;
  flex-grow: 0;
  align-self: center;
}

.error-message {
  flex-grow: 1;
  font-size: 18px;
}
</style>
