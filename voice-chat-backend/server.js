const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
const cors = require('cors');
const path = require('path');
require('dotenv').config(); // Para cargar variables de entorno
const app = express();

// Habilita CORS para permitir peticiones desde el frontend
app.use(cors());
app.use(express.json());

// Configuración de Multer para guardar los archivos subidos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Carpeta donde se guardarán los archivos
  },
  filename: (req, file, cb) => {
    // Crea un nombre único para el archivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Endpoint para subir la nota de voz
app.post('/upload', upload.single('audio'), (req, res) => {
  console.log('Archivo recibido:', req.file);
  res.json({ message: 'Archivo subido exitosamente', filename: req.file.filename });
});

// Inicia el servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});


// Configuración de AWS con las credenciales y región
aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,       // Define esta variable en un archivo .env
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // Define esta variable en un archivo .env
  region: process.env.AWS_REGION || 'us-east-1',      // O la región que corresponda
});

const s3 = new aws.S3();

// Habilitar CORS y parseo de JSON
app.use(cors());
app.use(express.json());

// Configurar multer para usar multer-s3
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET, // Define el nombre de tu bucket en el archivo .env
    acl: 'public-read',                // Ajusta el ACL según lo que necesites (por ejemplo, 'private')
    key: function (req, file, cb) {
      // Genera un nombre único para el archivo
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const fileName = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
      cb(null, fileName);
    },
  }),
});

// Endpoint para subir la nota de voz a S3
app.post('/upload', upload.single('audio'), (req, res) => {
  console.log('Archivo subido:', req.file);
  // La propiedad `location` en req.file contiene la URL pública del archivo en S3
  res.json({ message: 'Archivo subido exitosamente', fileLocation: req.file.location });
});
