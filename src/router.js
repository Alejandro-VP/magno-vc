// src/router.js
import Vue from 'vue';
import VueRouter from 'vue-router';

// Importa los componentes
import Register from './components/Register.vue';
import VoiceChat from './components/VoiceChat.vue'; // Tu componente principal del chat

Vue.use(VueRouter);

const routes = [
    { path: '/register', name: 'Register', component: Register },
    { path: '/chat', name: 'Chat', component: VoiceChat },
    { path: '*', redirect: '/register' }  // Redirige a registro si la ruta no coincide
];

const router = new VueRouter({
    mode: 'history', // Para URLs limpias
    routes
});

export default router;
