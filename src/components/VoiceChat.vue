<template>
  <div class="voice-chat">
    <h2>Chat en Tiempo Real</h2>
    <div class="controls">
      <button @click="startRecording" :disabled="isRecording">Iniciar Grabación</button>
      <button @click="stopRecording" :disabled="!isRecording">Detener Grabación</button>
    </div>
    <div v-if="audioUrl" class="audio-preview">
      <h3>Nota de Voz:</h3>
      <audio :src="audioUrl" controls></audio>
      <button @click="uploadAudio">
        Enviar
      </button>
    </div>
    <div class="chat-box">
      <div v-for="(msg, index) in messages" :key="index">
        <span v-if="msg.type === 'text'">{{ msg.content }}</span>
        <audio v-else-if="msg.type === 'audio'" :src="msg.content" controls></audio>
      </div>
    </div>
    <input v-model="message" placeholder="Escribe un mensaje..." />
    <button @click="sendMessage">Enviar Mensaje</button>
  </div>

</template>

<script>
import { io } from "socket.io-client";


export default {
  name: "VoiceChat",
  data() {
    return {
      isRecording: false,
      mediaRecorder: null,
      recordedChunks: [],
      audioUrl: null,
      audioBlob: null, // ✅ Ahora está definido
      message: "",
      messages: []
    };
  },

  mounted() {
    this.socket = io("https://magno-vc.onrender.com", {
      transports: ["websocket", "polling"],
    });

    this.socket.on("connect", () => {
      console.log("🔗 Conectado al servidor WebSocket");
    });

    this.socket.on("disconnect", () => {
      console.warn("⚠️ Desconectado del servidor WebSocket");
    });
    this.socket.off("send-message");
    this.socket.on("send-message", (message) => {
      this.messages.push({ type: "text", content: message });
    });
    this.socket.off("new_voice_message");
    this.socket.on("new_voice_message", (data) => {
      this.messages.push({ type: "audio", content: data.audioUrl });
    });
  },

  methods: {
    async startRecording() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Tu navegador no soporta la grabación de audio.");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.mediaRecorder = new MediaRecorder(stream);
        this.recordedChunks = [];
        this.isRecording = true;

        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.recordedChunks.push(event.data);
          }
        };

        this.mediaRecorder.onstop = () => {
          const blob = new Blob(this.recordedChunks, { type: "audio/webm" });
          this.audioUrl = URL.createObjectURL(blob);
          this.audioBlob = blob; // ✅ Ahora está bien definido
        };

        this.mediaRecorder.start();
      } catch (error) {
        console.error("Error al acceder al micrófono:", error);
      }
    },

    stopRecording() {
      if (this.mediaRecorder && this.isRecording) {
        this.mediaRecorder.stop();
        this.isRecording = false;
      }
    },

    sendMessage() {
      if (!this.message.trim()) return;
      this.socket.emit("send-message", this.message);
      //this.messages.push({ type: "text", content: this.message });
      this.message = "";
    },

    async uploadAudio() {
      if (!this.audioBlob) {
        alert("No se ha grabado ningún audio.");
        return;
      }

      const formData = new FormData();
      formData.append("audio", this.audioBlob, `audio-${Date.now()}.webm`);

      try {
        const response = await fetch("https://magno-vc.onrender.com/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("✅ Archivo subido con éxito:", data);

        // ❌ Eliminado: this.socket.emit('new_voice_message')
        // El backend debe emitir el mensaje cuando el archivo esté listo
        //this.socket.emit("new_voice_message", { audioUrl: data.fileLocation });
        this.audioUrl = null;
        this.audioBlob = null;
      } catch (error) {
        console.error("❌ Error al subir el archivo:", error);
      }
    },
  },
};
</script>


<style scoped>
button {
  margin: 10px;
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}
</style>
