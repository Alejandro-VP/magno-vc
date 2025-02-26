const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Configuración de AWS S3
aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
});

const s3 = new aws.S3();

app.use(cors());
app.use(express.json());

// Configuración de Multer para S3
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET,
    acl: 'public-read',
    key: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, 'audio-voz-' + uniqueSuffix + path.extname(file.originalname));
    },
  }),
});

// Ruta para subir archivos
app.post('/upload', upload.single('audio'), (req, res) => {
  if (req.file) {
    console.log('Archivo subido:', req.file);
    io.emit('new_voice_message', { audioUrl: req.file.location });
    res.status(200).json({ message: 'Archivo subido exitosamente', fileLocation: req.file.location });
  } else {
    return res.status(400).json({ message: 'No se pudo subir el archivo' });
  }
});

// WebSockets
io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado');

  // Escuchar mensajes de texto
  socket.on('send-message', (message) => {
    console.log('Mensaje recibido:', message);
    io.emit('send-message', message);
  });

  // Escuchar mensajes de voz
  socket.on('new_voice_message', (data) => {
    console.log('Nuevo mensaje de voz recibido:', data);
    io.emit('new_voice_message', data);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});


// 🚀 Rutas estáticas (Mover al final para evitar bloquear otras rutas)
app.use(express.static(path.join(__dirname, '../dist')));
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../dist', 'index.html'));
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor ejecutándose en ${PORT}`);
});
