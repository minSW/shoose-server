import api from './routes'; // from routes/index.js
import config from './config';
import express from 'express';
import mysql from 'mysql';

import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

var app = express();
app.use(express.json()); // for parsing
app.use(express.static('../public'));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(morgan('dev'));
app.use('/api', api);

var pool = mysql.createPool({
  host     : config.mysql.host,
  user     : config.mysql.user,
  password : config.mysql.password,
  database : config.mysql.database,
  connectionLimit : 20,
  waitForConnections : false
});

pool.getConnection(function(err,connection){
  if(!err) {
    console.log("Database is connected ... \n");
  } else {
    console.log(err);
    console.log("Error connecting Database .. \n");
  }
  connection.release();
});
app.set('dbPool', pool);

// catch thrown error
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status).json({
    error: err.message,
    code: -1
  });
  next();
});

app.listen(3000, function () {
  console.log('App server listening on port 3000!');
});