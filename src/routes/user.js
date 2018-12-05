import express from 'express';
import config from '../config';
//import session from 'express-session';
import jwt from 'jsonwebtoken';
import mysql from 'mysql';

const router = express.Router();

const connection = mysql.createConnection({
    host : config.mysql.host,
    user : config.mysql.user,
    password : config.mysql.password,
    database : config.mysql.database
})
var njson = {}

/* GET users listing. */
router.get('/',function(req, res,next) {
  connection.query('SELECT * from users where id=?' ,[req.body.id], function(err, rows, result){
  res.send(rows);
  });
});

router.post('/signup', function(req, res, next) {
  connection.query('SELECT max(SN) from users', function(err,SN,result){  
    njson = {SN: JSON.parse(JSON.stringify(SN[0]))['max(SN)']+1}
    connection.query('INSERT INTO users SET ?', [Object.assign(njson, req.body)], function(err, rows, result){
      console.log(SN, req.body);
      if(!err){
        res.status(200);
        res.send("Signup Success");
        console.log(req.body);
        console.log('Inserted :', rows);
      }
      else{
        console.log('Error while performing Query.');
        if(err['errno'] == 1062){
          res.status(409);
          res.send("409 - Conflict ID");
        }
        else{
          res.status(500);
          res.send("500 - Internal Server Error.");
        }
      }
    });
  });
});
  
router.post('/login', function(req, res, next) {
  let token = jwt.sign({
    id: req.body.id
  },
  config.secret,
  {
    expiresIn: '4h'
  });
  connection.query('SELECT * FROM users where id = ? and password = ?', [req.body.id, req.body.password], function(err, rows, result){
    console.log(req.body);
    if(rows == ''){
      console.log("No data.");
      res.status(404);
      res.send("404 - Login Failed.");
    }
    else if(!err){
      res.cookie("user", token);
      res.json({ token: token });
      //req.session.isLogin = true;
      //req.session.uid = rows[0].SN;
      //res.status(200);

      //res.send("Login Success");
      console.log("Login :", rows);
    }
    else{
      res.status(500);
      res.send("500 - Internal Server Error.");
      console.log('Error while performing Query.');
    }
  });
});

router.post('/logout', (req, res) => {
  res.clearCookie("user");
  res.json({ message: 'success', result: 'user' });
});

/*
router.post('/signup', (req, res) => {
  let id = req.body.id,
      password = req.body.password;
  user.uid+=1;
  user.id=id;
  user.password=password; // need to connect with mySQL & check duplicate
  res.json({ message: 'success', result: 'user' });
});

router.post('/login', (req, res) => {
  let id = req.body.id,
      password = req.body.password;
  if (user.id===id && user.password===password){ // need to check DB
      req.session.isLogin = true;
      req.session.displayName = user.id;
      res.json({ uid: user.uid, message: 'success', result: 'user' });
  } else {
      res.json({ message: 'error', result: 'user' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(function(err) {
    if(!err){
      res.json({ message: 'success', result: 'user' });
    } else {
      res.status(500);
      res.json({ message: 'error', result: 'user' });
    }
  });

});
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
*/
export default router;
