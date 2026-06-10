### 1* npm create vite@latest
* react
* typescript
### 2* updated vite.config.ts with
  server: {
    port: 3000  <!-- ← Change this to your desired port (e.g., 3000, 8080). I wanted to run at 3000 hence i provided it or else by default it will run at 5173 -->
  } 

### 3* Added utility/fileUpload.tsx <!-- you can code or get the code for upload file components from any where, stacks over flow or you you can use AI -->
### 4* Add the module FileUpload in your frontend/app.tsx
### 5* Added .env file in fronend folder and added
* VITE_BACKEND_URL = http://localhost:5000 // We have to add VITE_ infront of any variable to declare and to use it
use import.meta.env.VITE_BACKEND_URL

### 6* if you already have a backend folder created run `express --no-view --git --force`
#### if not then in main folder run `express backend --no-view --git`

### 7* run `npm install` in terminal

### 8* Run `npm install dotenv --save` in terminal/power shell

### 9* Add .env file in backend folder

### 10* add PORT <!-- the port on which you want to run your  -->

### 11* add `require('dotenv').config()` to your app.js

### 12* `npm install multer --save` to install multer app which will be allowing to parse multimedia in multipart format