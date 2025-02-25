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

// Configuración de AWS con las credenciales y región
aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,       // Define esta variable en un archivo .env
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // Define esta variable en un archivo .env
  region: process.env.AWS_REGION || 'us-east-1',      // O la región que corresponda
});

const s3 = new aws.S3();

// Configurar multer para usar multer-s3 (subir directamente a S3)
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET,  // Define el nombre de tu bucket en el archivo .env
    acl: 'public-read',                // Permite acceso público al archivo (ajusta según tu necesidad)
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const fileName = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
      cb(null, fileName);  // Guarda el archivo con un nombre único
    },
  }),
});

// Endpoint para subir la nota de voz a S3
app.post('/upload', upload.single('audio'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No se ha subido ningún archivo' });
  }
  
  console.log('Archivo subido a S3:', req.file);
  // La propiedad `location` contiene la URL pública del archivo subido
  res.json({ message: 'Archivo subido exitosamente', fileLocation: req.file.location });
});

// Inicia el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
