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
    bucket: process.env.AWS_S3_BUCKET,
    //acl: 'public-read',
    key: function (req, file, cb) {
      // Genera un nombre único usando la fecha actual y un número aleatorio
      const uniqueSuffix = Date.now() + '-' + Math.floor(Math.random() * 1e9);  // Asegura que sea único
      const fileName = `audio-voz-${uniqueSuffix}${path.extname(file.originalname)}`;  // Nombre único basado en la fecha y aleatoriedad
      console.log(`Nombre del archivo S3: ${fileName}`);  // Verifica el nombre generado
      cb(null, fileName);  // Asigna este nombre como la clave en S3
    },
  }),
});



// Endpoint para subir múltiples notas de voz a S3
app.post('/upload', upload.array('audio', 10), (req, res) => { // Cambia 10 al número máximo de archivos que deseas permitir
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No se ha subido ningún archivo' });
  }

  console.log('Archivos subidos a S3:', req.files);
  // La propiedad `location` contiene la URL pública de cada archivo subido
  const fileLocations = req.files.map(file => file.location);
  res.json({ message: 'Archivos subidos exitosamente', fileLocations });
});

// Inicia el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});