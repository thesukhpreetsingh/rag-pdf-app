import { useState } from 'react'


function FileUpload() {
  const [file, setFile] = useState<File | null>(null)

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
      console.log('Upload successful:', response)
    } catch (error) {
      console.error('Upload failed:', error)
    }
  }

  return (
    <div>
      <input type="file" onChange={handleFileChange} accept=".pdf, .doc, .docx" />
      {file && <p>Selected: {file.name} of size {file.size}</p>}
      <button onClick={handleUpload}>Upload</button>
    </div>
  )
}

export default FileUpload