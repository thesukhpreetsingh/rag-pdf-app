import { useState } from 'react'
import FileUpload from './utility/fileUpload'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <FileUpload />
    </>
  )
}

export default App
