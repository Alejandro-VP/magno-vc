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
      <div v-for="(msg, index) in messages" :key="index">{{ msg }}</div>
    </div>
    <input v-model="message" placeholder="Escribe un mensaje..." />
    <button @click="sendMessage">Enviar Mensaje</button>
  </div>

</template>

<script>
//import AWS from 'aws-sdk/dist/aws-sdk-react-native'; // Asegúrate de importar AWS SDK correctamente
import { io } from 'socket.io-client';
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
    // Conectar al servidor de WebSockets
    const socket = io('https://magno-vc.onrender.com'); // Cambia la URL si es necesario

    // Escuchar el evento 'new_voice_message' desde el servidor
    socket.on('new_voice_message', (data) => {
      console.log('Nuevo mensaje de voz:', data);
      this.messages.push({ id: Date.now(), audioUrl: data.audioUrl });
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
      // Envía el mensaje al servidor
      console.log("Enviando mensaje:", this.message);
      this.socket.emit('send-message', this.message);
      this.message = '';  // Limpiar campo de mensaje
    },

    // Método para subir el audio al bucket de S3
    async uploadAudio() {
      if (!this.audioBlob) {
        alert("No se ha grabado ningún audio.");
        return;
      }
      const uniqueSuffix = Date.now() + '-' + Math.floor(Math.random() * 1e9);
      const fileName = `audio-voz-${uniqueSuffix}.webm`;  // El nombre del archivo será único cada vez


      const archivo = new File([this.audioBlob], fileName, { type: "audio/webm" });

      AWS.config.update({
        accessKeyId: 'AKIARU2QHV2A6ANPTSYI',  // Sustituye con tu Access Key ID
        secretAccessKey: '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', // Sustituye con tu Secret Access Key
        region: 'eu-north-1',  // Cambia la región si es necesario
      });

      const s3 = new AWS.S3();

      const params = {
        Bucket: 'mi-bucket-voice-chat',  // Reemplaza con el nombre de tu bucket
        Key: archivo.name,  // El nombre del archivo en S3
        Body: archivo,  // El contenido del archivo
        ContentType: archivo.type,  // El tipo de archivo
        //ACL: 'public-read',  // Permisos (opcional, depende de tus necesidades)
      };

      try {
        // Usar el método .promise() para manejar la subida de manera asíncrona
        const data = await s3.upload(params).promise();
        console.log("Archivo subido exitosamente:", data);
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
