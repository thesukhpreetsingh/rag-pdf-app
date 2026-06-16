import { useState } from 'react'
import FileUpload from './utility/fileUpload'
import './App.css'


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <header style={{ textAlign: 'center', marginBottom: '2rem', color: '#333' }}>
        <h1>RAG PDF App</h1>
        <p><a href="https://www.linkedin.com/in/sukhpreet-singh-41b18950/" target="_blank" rel="noopener noreferrer">Sukhpreet Singh - LinkedIn Profile</a></p>
      </header>

      <FileUpload />
    </>
  )
}

export default App
