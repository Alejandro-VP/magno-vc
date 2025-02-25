<template>
    <div class="voice-chat">
      <h2>Chat de Notas de Voz</h2>
      <div class="controls">
        <button @click="startRecording" :disabled="isRecording">
          Iniciar Grabación
        </button>
        <button @click="stopRecording" :disabled="!isRecording">
          Detener Grabación
        </button>
      </div>
      <div v-if="audioUrl" class="audio-preview">
        <h3>Nota de Voz:</h3>
        <audio :src="audioUrl" controls></audio>
      </div>
    </div>
  </template>
  
  <script>
import axios from 'axios';

export default {
  name: "VoiceChat",
  data() {
    return {
      isRecording: false,
      mediaRecorder: null,
      recordedChunks: [],
      audioUrl: null,
    };
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
          // Llama a la función para subir el archivo
          this.uploadAudio(blob);
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

    // Método para subir el audio al bucket de S3
    async uploadAudio(blob) {
      // Prepara el archivo para subir
      const archivo = new File([blob], "audio-voz.webm", { type: "audio/webm" });

      AWS.config.update({
        accessKeyId: 'TU_ACCESS_KEY_ID',  // Sustituye con tu Access Key ID
        secretAccessKey: 'TU_SECRET_ACCESS_KEY', // Sustituye con tu Secret Access Key
        region: 'eu-north-1',  // Cambia la región si es necesario
      });

      const s3 = new AWS.S3();

      const params = {
        Bucket: 'mi-bucket-voice-chat',  // Reemplaza con el nombre de tu bucket
        Key: archivo.name,  // El nombre del archivo en S3
        Body: archivo,  // El contenido del archivo
        ContentType: archivo.type,  // El tipo de archivo
        ACL: 'public-read',  // Permisos (opcional, depende de tus necesidades)
      };

      s3.upload(params, (err, data) => {
        if (err) {
          console.log("Error al subir el archivo:", err);
        } else {
          console.log("Archivo subido exitosamente:", data);
        }
      });
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