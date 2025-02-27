<template>
    <div>
        <h2>Registro</h2>
        <input v-model="username" placeholder="Usuario" />
        <input v-model="email" placeholder="Correo" />
        <input v-model="password" type="password" placeholder="Contraseña" />
        <button @click="registerUser">Registrarse</button>

        <h2>Inicio de Sesión</h2>
        <input v-model="loginEmail" placeholder="Correo" />
        <input v-model="loginPassword" type="password" placeholder="Contraseña" />
        <button @click="loginUser">Iniciar Sesión</button>
    </div>
</template>

<script>
export default {
    data() {
        return {
            username: '',
            email: '',
            password: '',
            loginEmail: '',
            loginPassword: '',
        };
    },
    methods: {
        async registerUser() {
            try {
                const res = await fetch("https://tu-backend.com/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        username: this.username,
                        email: this.email,
                        password: this.password,
                    }),
                });
                const data = await res.json();
                console.log("Registro:", data);
            } catch (error) {
                console.error("Error al registrar:", error);
            }
        },
        async loginUser() {
            try {
                const res = await fetch("https://tu-backend.com/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: this.loginEmail,
                        password: this.loginPassword,
                    }),
                });
                const data = await res.json();
                console.log("Inicio de sesión:", data);
                // Guarda el token en localStorage o en un store para usarlo en peticiones protegidas
                localStorage.setItem("token", data.token);
            } catch (error) {
                console.error("Error al iniciar sesión:", error);
            }
        },
    },
};
</script>