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

// last
app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

