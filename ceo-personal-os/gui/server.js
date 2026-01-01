const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const multer = require('multer');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Base path for CEO OS files
const basePath = path.join(__dirname, '..');

// Ensure upload directories exist
const uploadDirs = ['past_annual_reviews', 'notes'];
uploadDirs.forEach(dir => {
  const fullPath = path.join(basePath, 'uploads', dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.params.folder;
    const uploadPath = path.join(basePath, 'uploads', folder);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage });

// API Routes

// Get file content
app.get('/api/files/*', (req, res) => {
  const filePath = req.params[0];
  const fullPath = path.join(basePath, filePath);
  if (fs.existsSync(fullPath)) {
    fs.readFile(fullPath, 'utf8', (err, data) => {
      if (err) return res.status(500).send('Error reading file');
      res.json({ content: data });
    });
  } else {
    res.status(404).send('File not found');
  }
});

// Save file content
app.put('/api/files/*', (req, res) => {
  const filePath = req.params[0];
  const fullPath = path.join(basePath, filePath);
  const content = req.body.content;
  fs.writeFile(fullPath, content, 'utf8', (err) => {
    if (err) return res.status(500).send('Error saving file');
    res.send('File saved');
  });
});

// List files in a folder
app.get('/api/list/*', (req, res) => {
  const folderPath = req.params[0];
  const fullPath = path.join(basePath, folderPath);
  if (fs.existsSync(fullPath)) {
    fs.readdir(fullPath, (err, files) => {
      if (err) return res.status(500).send('Error listing files');
      res.json({ files });
    });
  } else {
    res.json({ files: [] });
  }
});

// Create new file from template
app.post('/api/create', (req, res) => {
  const { templatePath, newPath } = req.body;
  const templateFull = path.join(basePath, templatePath);
  const newFull = path.join(basePath, newPath);
  if (fs.existsSync(templateFull)) {
    fs.copyFile(templateFull, newFull, (err) => {
      if (err) return res.status(500).send('Error creating file');
      res.send('File created');
    });
  } else {
    res.status(404).send('Template not found');
  }
});

// Upload files
app.post('/api/upload/:folder', upload.single('file'), (req, res) => {
  res.send('File uploaded');
});

// Start server
app.listen(PORT, () => {
  console.log(`CEO Personal OS GUI running at http://localhost:${PORT}`);
});