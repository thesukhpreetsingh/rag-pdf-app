### npm create vite@latest
* react
* typescript
### updated vite.config.ts with
  server: {
    port: 3000 // ← Change this to your desired port (e.g., 3000, 8080). I wanted to run at 3000 hence i provided it or else by default it will run at 5173
  } 

### Added utility/fileUpload.tsx
### Added .env file in fronend folder and added
* VITE_BACKEND_URL = http://localhost:5000 // We have to add VITE_ infront of any variable to declare and to use it
use import.meta.env.VITE_BACKEND_URL