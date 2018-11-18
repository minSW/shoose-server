import api from './routes'; // from routes/index.js
import express from 'express';
// var express = require('express');

var app = express();
app.use(express.json()); // for parsing
app.use(express.static('../public'));


app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.use('/api', api);


// catch thrown error
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status).json({
    error: err.message,
    code: -1
  });
});

app.listen(3000, function () {
  console.log('App server listening on port 3000!');
});

