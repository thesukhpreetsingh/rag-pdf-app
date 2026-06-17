require('dotenv').config()
var express = require('express');
const connectDB = require("./config/db.js")
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var cors = require("cors")

var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');

var app = express();
app.use(cors({
  origin: [
    'http://localhost:3000',
  ],
  credentials: true
}));

// using db connection
(async () => {
  try {
    await connectDB();
    console.log("Database connected");
  } catch (err) {
    console.error("Database connection failed", err);
  }
})();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
// app.use('/users', usersRouter);

module.exports = app;
