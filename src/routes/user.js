import express from 'express';
import config from '../config';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/signup', (req, res, next) => {
  var pool = req.app.get('dbPool');
  pool.getConnection((error, connection) => {
    connection.query('SELECT * FROM users WHERE ID=?',[req.body.ID], (err, rows, result) => {
      if (rows == '') {
        connection.query('SELECT max(SN) as max FROM users', (err,SN,result) => {
          var njson = { SN: SN[0].max+1 } // assign SN
          
          connection.query('INSERT INTO users SET ?', [Object.assign(njson, req.body)], (err, rows, result) => {
            console.log(njson);
            if (err) {
              connection.release();
              console.log('Query Error - POST signup');
              res.status(500);
              res.json({ message: 'error', result: 'user' });
              throw err;
            }
            connection.release();
            res.json({ message: 'success', result: 'user' });
          });
       });
      }
      else {
        connection.release();
        console.log('Conflict - POST signup');
        res.status(409);
        res.json({ message: 'conflict', result: 'user' });
      }
    });
  });
});

router.post('/login', (req, res, next) => {
  var pool = req.app.get('dbPool');
  pool.getConnection((error,connection) => {
    connection.query('SELECT SN FROM users where ID = ? and password = ?', [req.body.ID, req.body.password], (err, rows, result) => {
      console.log(req.body);
      if (err) {
        connection.release();
        console.log('Query Error - POST signup');
        res.status(500).send("Internal Server Error");
        throw err;
      } 
      
      if (rows == '') {
        console.log("Not Found - POST login");
        res.status(404).send("Not Found");
      }
      else {
        let token = jwt.sign({ id: req.body.id }, config.secret, { expiresIn: '4h' });

        res.cookie("user", token);
        res.json({ token: token , SN : rows[0].SN });
      }
      connection.release();
    });
  });
});

router.post('/logout', (req, res) => {
  res.clearCookie("user");
  res.json({ message: 'success', result: 'user' });
});

export default router;
