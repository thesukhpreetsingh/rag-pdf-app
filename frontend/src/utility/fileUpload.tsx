import { useState, useRef } from 'react'
import './fileUpload.css'


function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return console.log("No file")

    const formData = new FormData()
    formData.append('file', file)

    try {
        console.log(import.meta.env.VITE_BACKEND_URL+"/upload")
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/upload`, {
            method: 'POST',
            body: formData,
        })
        let resp = await response.json()
        // console.log('Upload successful:', resp)
        alert(`${resp.file} uploaded sucessfully`)
        setFile(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    } catch (error) {
      console.error('Upload failed:', error)
    }
  }

  return (
    <div className="file-upload-container">
      <h2 className="file-upload-title">File Upload</h2>
      
      <form onSubmit={(e) => { e.preventDefault(); handleUpload() }} className="upload-form">
        <div className="file-input-wrapper">
          <label htmlFor="fileInput" className="custom-file-label">
            <span className="file-icon">📄</span>
            {!file ? "Select a file to upload (PDF, DOC, DOCX)" : `Selected: ${file.name}`}
          </label>
          <input 
            type="file" 
            id="fileInput" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".pdf, .doc, .docx" 
          />
        </div>

        <button type="submit" className="upload-button">Upload</button>
      </form>
    </div>
  )
}

export default FileUpload