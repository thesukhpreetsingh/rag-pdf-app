import express from "express"
const router = express.Router()

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import multer from "multer";

import { PDFParse } from "pdf-parse";
// import { error } from "console";

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../public/uploads/documents'),
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replaceAll(" ","")}`)
  }
})

const upload = multer({
  storage,
  limits: { 
    fileSize: 5 * 1024 * 1024 // 10MB limit
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

router.post('/upload', upload.single('file'), function(req, res) {
  // console.log(req.file)
  if(!req.file) return res.json({error:true, message:"No files uploaded"})
  let file = req.file.originalname;

  return res.json({status:200, message :"Ok. Hoi", file:file})
});
export default router
