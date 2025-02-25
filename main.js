import Vue from 'vue';
import VoiceChat from './src/components/VoiceChat.vue';
import { createApp } from 'vue';
import App from './App.vue';

createApp(App).mount('#app');

/*
new Vue({
render: (h) => h(VoiceChat),
}).$mount('#app');
*/