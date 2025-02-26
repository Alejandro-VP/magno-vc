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
//import AWS from 'aws-sdk/dist/aws-sdk-react-native'; // Asegúrate de importar AWS SDK correctamente
import { io } from 'socket.io-client';
const socket = io("https://magno-vc.onrender.com", {
  transports: ["websocket"],
});

export default {
  name: "VoiceChat",
  data() {
    return {
      isRecording: false,
      mediaRecorder: null,
      recordedChunks: [],
      audioUrl: null,
      message: '',
      messages: [],  // Array para almacenar los mensajes
      socket: null,   // Socket.io instance
    };
  },

  mounted() {
    // Inicializar el socket y almacenarlo en this.socket
    this.socket = io('https://magno-vc.onrender.com', { transports: ["websocket", "polling"] });

    this.socket.on('connect', () => {
      console.log("🔗 Conectado al servidor WebSocket");
    });

    this.socket.on('disconnect', () => {
      console.warn("⚠️ Desconectado del servidor WebSocket");
    });

    // Escuchar eventos
    this.socket.on('send-message', (message) => {
      this.messages.push({ type: 'text', content: message });
    });

    this.socket.on('new_voice_message', (data) => {
      this.messages.push({ type: 'audio', content: data.audioUrl });
    });
  },
  methods: {

    async startRecording() {
      // Verifica que el navegador soporte getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Tu navegador no soporta la grabación de audio.");
        return;
      }

      try {
        // Solicita permiso para usar el micrófono
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Crea una instancia de MediaRecorder con el stream de audio
        this.mediaRecorder = new MediaRecorder(stream);
        // Reinicia los chunks grabados
        this.recordedChunks = [];
        // Inicia la grabación
        this.mediaRecorder.start();
        this.isRecording = true;

        // Almacena los datos disponibles conforme se graba
        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.recordedChunks.push(event.data);
          }
        };

        // Cuando se detiene la grabación, crea un Blob con los datos y genera una URL
        this.mediaRecorder.onstop = () => {
          const blob = new Blob(this.recordedChunks, { type: "audio/webm" });
          this.audioUrl = URL.createObjectURL(blob);
          this.audioBlob = blob;  // Guardamos el blob para enviarlo luego
        };
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

      console.log("Enviando mensaje de texto:", this.message);
      this.socket.emit('send-message', this.message);

      this.messages.push({ type: 'text', content: this.message });
      this.message = '';  // Limpiar el campo
    }
    ,

    // Método para subir el audio al bucket de S3
    async uploadAudio() {
      if (!this.audioBlob) {
        alert("No se ha grabado ningún audio.");
        return;
      }

      const formData = new FormData();
      formData.append('audio', this.audioBlob, `audio-${Date.now()}.webm`);

      try {
        const response = await fetch('https://magno-vc.onrender.com/upload', {
          method: 'POST',
          body: formData
        });

        const data = await response.json();
        console.log("Archivo subido con éxito:", data);

        // Emitir el mensaje de voz al servidor WebSocket
        this.socket.emit('new_voice_message', { audioUrl: data.fileLocation });

        // Agregar el mensaje de voz a la lista de mensajes del chat
        this.messages.push({ type: 'audio', content: data.fileLocation });

      } catch (error) {
        console.error("Error al subir el archivo:", error);
      }
    }

  }
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
