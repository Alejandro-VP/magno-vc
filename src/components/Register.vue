// src/components/Register.vue (ejemplo)
<template>
    <div>
        <h2>Registro de Usuario</h2>
        <input v-model="email" placeholder="Correo" />
        <input v-model="password" type="password" placeholder="Contraseña" />
        <button @click="registerUser">Registrarse</button>
    </div>
</template>

<script>
import { ref } from 'vue';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export default {
    name: "Register",
    setup() {
        const email = ref("");
        const password = ref("");

        const registerUser = async () => {
            try {
                // Ahora se usa createUserWithEmailAndPassword(auth, email, password)
                const userCredential = await createUserWithEmailAndPassword(
                    auth,
                    email.value,
                    password.value
                );
                console.log("Usuario creado:", userCredential.user);
            } catch (error) {
                console.error("Error al registrar:", error);
            }
        };

        return {
            email,
            password,
            registerUser
        };
    }
};
</script>
