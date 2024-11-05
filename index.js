import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';

dotenv.config(); // Memuat variabel lingkungan dari file .env

// Konfigurasi multer untuk menyimpan file di folder src/files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), 'src', 'files')); // Menentukan direktori penyimpanan
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Menyimpan file dengan nama aslinya
  }
});

const upload = multer({ storage: storage });

var app = express();

app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Route untuk menerima dan menganalisis file
app.post('/api/fileanalyse', upload.single('upfile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Mengambil metadata file dari req.file dan membentuk respons sesuai permintaan
  const fileMetadata = {
    name: req.file.originalname,  // Mengambil nama file asli
    type: req.file.mimetype,      // Mengambil tipe MIME file
    size: req.file.size           // Mengambil ukuran file dalam byte
  };

  // Mengirimkan metadata sebagai respons JSON
  res.json(fileMetadata);
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Your app is listening on port http://localhost:' + port)
});
