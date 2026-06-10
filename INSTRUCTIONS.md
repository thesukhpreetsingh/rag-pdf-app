### npm create vite@latest
* react
* typescript
### updated vite.config.ts with
  server: {
    port: 3000  <!-- ← Change this to your desired port (e.g., 3000, 8080). I wanted to run at 3000 hence i provided it or else by default it will run at 5173 -->
  } 

### Added utility/fileUpload.tsx <!-- you can code or get the code for upload file components from any where, stacks over flow or you you can use AI -->
### Add the module FileUpload in your frontend/app.tsx
### Added .env file in fronend folder and added
* VITE_BACKEND_URL = http://localhost:5000 // We have to add VITE_ infront of any variable to declare and to use it
use import.meta.env.VITE_BACKEND_URL

### if you already have a backend folder created run `express --no-view --git --force`
#### if not then in main folder run `express backend --no-view --git`

### run `npm install` in terminal

### Run `npm install dotenv --save` in terminal/power shell