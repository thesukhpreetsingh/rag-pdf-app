const express = require("express");
const router = express.Router();
const path = require('path');
const multer = require("multer");
const uploadedFile = require("../models/uploadedFile");

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../public/uploads/documents'),
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replaceAll(" ","")}`)
  }
})

const upload = multer({
  storage,
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/pdf',        // PDF
      'application/msword',     // DOC
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // DOCX
    ]
    
    const allowedExtensions = ['.pdf', '.doc', '.docx']
    const hasValidExtension = allowedExtensions.includes(
      path.extname(file.originalname).toLowerCase()
    )

    if (allowedMimes.includes(file.mimetype) || hasValidExtension) {
      cb(null, true)
    } else {
      cb(new Error('Only PDF and DOC/DOCX files are allowed'))
    }
  }
})

router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.post('/upload', upload.single('file'), async function(req, res) {
  try {
    if(!req.file) return res.json({error:true, message:"No files uploaded"})
    
    // Save to MongoDB
    console.log(req.file)
    const newFile = new uploadedFile({
      name: req.file.originalname,
      filename:req.file.fileName,
      statusHistory: [{
        status: "Uploaded",
        updatedAt: new Date()
      }],
      path : `/uploads/documents/${req.file.filename}`
    });
    
    await newFile.save();

    return res.json({
      status: 200, 
      message: "File uploaded and saved to database successfully", 
      file: req.file.originalname
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: true, message: "Internal server error" });
  }
});

module.exports = router;
