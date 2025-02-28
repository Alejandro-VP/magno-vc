// src/router.js
import { createRouter, createWebHistory } from 'vue-router';
import Register from './components/Register.vue';
import VoiceChat from './components/VoiceChat.vue';

const routes = [
    { path: '/register', name: 'Register', component: Register },
    { path: '/chat', name: 'VoiceChat', component: VoiceChat },
    // Redirige a /register si la ruta no existe
    { path: '/', redirect: '/register' }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;

