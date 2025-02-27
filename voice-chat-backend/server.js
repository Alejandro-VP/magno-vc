const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(cors());
app.use(express.json());

// 🚀 Configuración de AWS S3
const s3 = new S3Client({
  region: process.env.AWS_REGION || "us-east-1", // ⚠️ Usa la región de tu bucket
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// 🚀 Configuración de Multer (para almacenar archivos temporalmente)
const upload = multer({
  storage: multer.memoryStorage(), // Guarda en memoria antes de enviarlo a S3
  limits: { fileSize: 10 * 1024 * 1024 }, // Máximo 10MB
});

// 🚀 Función para subir archivos a S3
async function uploadToS3(fileBuffer, fileName, mimeType) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,  // ⚠️ Usa tu variable de entorno
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimeType || "audio/webm", // ⚠️ Cambia el tipo MIME si es necesario
    ACL: "public-read", // Permite leer
  };

  try {
    console.log("🚀 Subiendo archivo a S3:", fileName);
    const command = new PutObjectCommand(params);
    await s3.send(command);
    console.log("✅ Subida exitosa:", fileName);
    return `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${fileName}`;
  } catch (error) {
    console.error("❌ Error al subir a S3:", error);
    throw error;
  }
}

// 🚀 Ruta para subir archivos de audio
app.post('/upload', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No se recibió ningún archivo' });
  }

  try {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileName = `audio-voz-${uniqueSuffix}${path.extname(req.file.originalname)}`;

    const fileUrl = await uploadToS3(req.file.buffer, fileName, req.file.mimetype);

    io.emit('new_voice_message', { audioUrl: fileUrl });
    res.status(200).json({ message: 'Archivo subido exitosamente', fileUrl });
  } catch (error) {
    res.status(500).json({ message: 'Error al subir el archivo', error: error.message });
  }
});

// 🚀 WebSockets
io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado');

  socket.on('send-message', (message) => {
    console.log('Mensaje recibido:', message);
    io.emit('send-message', message);
  });

  socket.on('new_voice_message', (data) => {
    console.log('Nuevo mensaje de voz recibido:', data);
    io.emit('new_voice_message', data);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

// 🚀 Rutas estáticas
app.use(express.static(path.join(__dirname, '../dist')));
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../dist', 'index.html'));
});

// 🚀 Iniciar el servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor ejecutándose en ${PORT}`);
});

// Configuración de Multer para S3
/*
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
*/