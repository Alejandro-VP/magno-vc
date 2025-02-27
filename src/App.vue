<script setup>

</script>

<template>
  <div>
    <h1>¡Bienvenido al chat de notas de voz!</h1>

    <VoiceChat />
  </div>
</template>

<script>
import VoiceChat from './components/VoiceChat.vue';

export default {
  components: {
    VoiceChat,
  },
};
</script>

<style>
div {
  text-align: center;
}
</style>