<template>
    <div class="register">
        <h2>Registro de Usuario</h2>
        <input v-model="username" placeholder="Nombre de usuario" />
        <input v-model="email" placeholder="Correo electrónico" />
        <input v-model="password" type="password" placeholder="Contraseña" />
        <button @click="registerUser">Registrarse</button>
    </div>
</template>

<script>
import { auth, db, firebase } from "../firebase"; // Asegúrate de importar tu configuración

export default {
    name: "Register",
    data() {
        return {
            username: "",
            email: "",
            password: ""
        };
    },
    methods: {
        async registerUser() {
            try {
                // Crea el usuario en Firebase Authentication
                const userCredential = await auth.createUserWithEmailAndPassword(this.email, this.password);
                const user = userCredential.user;

                // Guarda información adicional en la colección "users"
                await db.collection("users").doc(user.uid).set({
                    username: this.username,
                    email: this.email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                alert("Usuario registrado con éxito");
                // Redirige al usuario al chat
                this.$router.push("/chat");
            } catch (error) {
                console.error("Error al registrar usuario:", error);
                alert(error.message);
            }
        }
    }
};
</script>


<style scoped>
/* Agrega estilos según tus necesidades */
</style>