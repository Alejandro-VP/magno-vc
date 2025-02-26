const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
require('dotenv').config(); // Para cargar variables de entorno

// Crea la aplicación Express y el servidor HTTP

const app = express();

app.use(express.static(path.join(__dirname, '../dist')));
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../dist', 'index.html')); // Enviar el archivo index.html
});

const http = require('http').Server(app);
const io = socketIo(http);
const server = http.createServer(app);
// Inicializa Socket.io con el servidor HTTP
// Configuración de AWS (asegúrate de tener el archivo .env en Render)
aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
});

const s3 = new aws.S3();

// Configuración de CORS
app.use(cors());
app.use(express.json());

/* Configuración de Multer para manejar las subidas de archivos
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET,
    acl: 'public-read',
    key: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const fileName = 'audio-voz-' + uniqueSuffix + path.extname(file.originalname);
      cb(null, fileName);
    },
  }),
});

// Endpoint para subir el archivo
app.post('/upload', upload.single('audio'), (req, res) => {
  console.log('Archivo subido:', req.file);
  res.json({ message: 'Archivo subido exitosamente', fileLocation: req.file.location });
});
*/

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

app.post('/upload', upload.single('audio'), (req, res) => {
  console.log('Archivo subido:', req.file);
  res.json({ message: 'Archivo subido exitosamente', fileLocation: req.file.location });
});

const params = {
  Bucket: 'mi-bucket-voice-chat', // Nombre de tu bucket
  Key: req.file.filename,
  Body: req.file.buffer,
  ContentType: req.file.mimetype,
  ACL: 'public-read',
};

s3.upload(params, (err, data) => {
  if (err) {
    return res.status(500).send('Error al subir archivo');
  }

  // Emitir el mensaje de voz a todos los clientes conectados
  io.emit('new_voice_message', { audioUrl: data.Location });

  // Responder con éxito
  res.status(200).send({ message: 'Archivo subido exitosamente', fileLocation: data.Location });
});


/*
// Establecer conexión de WebSocket
io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado');

  // Escuchar mensaje del cliente y retransmitirlo a todos los usuarios
  socket.on('send-message', (message) => {
    io.emit('receive-message', message);  // Envía a todos los clientes conectados
  });

  // Escuchar desconexión
  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});
*/

// Iniciar servidor en el puerto asignado por Render
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor ejecutándose en ${PORT}`);
});
