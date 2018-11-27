import api from './routes'; // from routes/index.js
import config from './config';
import express from 'express';
import session from 'express-session';
// var express = require('express');

var app = express();
app.use(express.json()); // for parsing
app.use(express.static('../public'));

app.use(session({
    secret: config.secret,
    resave: false,
    saveUninitialized: true, // no publish new session id
    cookie: {
        maxAge: 1000 * 60 * 60 * 4 // Sessions will be maintained for 4 hours
    }
}));

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

