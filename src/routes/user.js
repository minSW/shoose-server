import express from 'express';
import config from '../config';
import jwt from 'jsonwebtoken';

const router = express.Router();

var njson = {}

router.post('/signup', (req, res, next) => {
  var pool = req.app.get('dbPool');
  pool.getConnection((error, connection) => {
    connection.query('SELECT * from users where ID=?',[req.body.ID], function(err, rows, result){
      if(rows == ''){
        console.log(rows);
        connection.query('SELECT max(SN) from users', function(err,SN,result){  
        njson = {SN: JSON.parse(JSON.stringify(SN[0]))['max(SN)']+1}
        connection.query('INSERT INTO users SET ?', [Object.assign(njson, req.body)], function(err, rows, result){
          console.log(SN, req.body);
          if(!err){
            res.json({message: 'sucess', result: 'user'});
          }
          else{
            connection.release();
            console.log('Query Error - POST signup');
            res.status(500);
            res.json({message: 'error', result: 'user'});
            throw err;
          }
         });
       });
      }
      else{
        console.log('Conflict - POST signup');
        res.status(409);
        res.json({message: 'conflict', result: 'user'});
      }
    });
    connection.release();
  });
});

router.post('/login', (req, res, next) => {
  let token = jwt.sign({
    id: req.body.id
  },
  config.secret,
  {
    expiresIn: '4h'
  });

  var pool = req.app.get('dbPool');
  pool.getConnection((error,connection) => {
    connection.query('SELECT SN FROM users where ID = ? and password = ?', [req.body.ID, req.body.password], function(err, rows, result){
      console.log(req.body);
      if(rows == ''){
        console.log("Not Found - POST login");
        res.status(404).send("Not Found");
      }
      else if(!err){
        res.cookie("user", token);
        res.json({ token: token , SN : rows[0].SN});
     //   res.send(JSON.parse(JSON.stringify(rows[0])));
      }
      else{
        console.log('Query Error - POST signup');
        res.status(500).send("Internal Server Error");
      }
    });
    connection.release();
  });
});

router.post('/logout', (req, res) => {
  res.clearCookie("user");
  res.json({ message: 'success', result: 'user' });
});

export default router;
