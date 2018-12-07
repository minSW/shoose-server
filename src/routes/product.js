import express from 'express';
import request from 'request';
import config from '../config';

const router = express.Router();

router.get('/:pid', (req, res, next) => {
  var pool = req.app.get('dbPool');
  pool.getConnection((error, connection) => {
    connection.query('SELECT * from product where pid=?',[req.params.pid], function(err, rows, result){
      if(rows == ''){
        //console.log(req.params.pid + " " +rows);
        console.log('Not Found - GET Product Info');
        res.status(404).send('Not Found');
      }
      else{
        if (err){
          connection.release();
          console.log('Internal Server Error - GET Product Info');
          res.status(500).send('Internal Server Error');
          throw err;
        }
        res.json(rows[0]);
      }
    });
    connection.release();
  });
});

router.post('/like', (req, res) => {
  var pool = req.app.get('dbPool');
  pool.getConnection((error, connection) => {
    connection.query(`INSERT INTO like_user (SN,pid) SELECT ?,? FROM DUAL 
    WHERE NOT EXISTS (SELECT * FROM like_user WHERE SN=? and pid=?)`, [req.body.SN, req.body.pid, req.body.SN, req.body.pid ], function(err, rows, result){
      if(err) {
        console.log('Query Error - POST like_user');
        res.status(500);
        res.json({ message: 'error', result: 'product' });
      }
      else if (rows.affectedRows===0){
        console.log('Conflict - POST like_user');
        res.status(409);
        res.json({ message: 'conflict', result: 'product' });
      }
      else {
        res.json({ message: 'success', result: 'product' });
      }
    });
    connection.release();
  });
});

router.get('/like/:SN', (req, res) => {
  var pool = req.app.get('dbPool');
  pool.getConnection((error, connection) => {
    connection.query('SELECT * FROM like_user WHERE SN=?',[req.params.SN], function(err, rows, result){
      if(rows == ''){
       // console.log(req.params.SN + " " + rows);
        console.log('Not Found - GET like_user');
        res.status(404).send('Not Found');
      }
      else{
        if (err){
          connection.release();
          console.log('Internal Server Error - GET like_user');
          res.status(500).send('Internal Server Error');
          throw err;
        }
        res.json(rows);
      }
    });
    connection.release();
  });
});

router.post('/wish', (req, res) => {
  var pool = req.app.get('dbPool');
  pool.getConnection((error, connection) => {
    connection.query(`INSERT INTO wish_list (SN,pid) SELECT ?,? FROM DUAL 
    WHERE NOT EXISTS (SELECT * FROM wish_list WHERE SN=? and pid=?)`, [req.body.SN, req.body.pid, req.body.SN, req.body.pid ], function(err, rows, result){
      if(err) {
        console.log('Query Error - POST wish_list');
        res.status(500);
        res.json({ message: 'error', result: 'product' });
      }
      else if (rows.affectedRows===0){
        console.log('Conflict - POST wish_list');
        res.status(409);
        res.json({ message: 'conflict', result: 'product' });
      }
      else {
        res.json({ message: 'success', result: 'product' });
      }
    });
    connection.release();
  });
});

router.get('/wish/:SN', (req, res, next) => {
  var pool = req.app.get('dbPool');
  pool.getConnection((error, connection) => {
    connection.query('SELECT * FROM wish_list WHERE SN=?',[req.params.SN], function(err, rows, result){
      if(rows == ''){
        //  console.log(req.params.SN + " " + rows);
        console.log('Not Found - GET wish_list');
        res.status(404).send('Not Found');
      }
      else{
        if (err){
          connection.release();
          console.log('Internal Server Error - GET wish_list');
          res.status(500).send('Internal Server Error');
          throw err;
        }
      res.json(rows);
      }
    });
    connection.release();
  });
});

var getLinkOptions = {
  url: config.naver.url,
  headers: {
    'X-Naver-Client-Id': config.naver.id,
    'X-Naver-Client-Secret': config.naver.secret
  },
  qs: {
    display: 5,
    start: 1,
    sort: 'sim' // asc
  }
}

router.get('/link/:pid', (req, res) => { 
  let pid = req.params.pid; 
  var pool = req.app.get('dbPool');

  pool.getConnection((error, connection) => {
    connection.query('SELECT pid, pname, link FROM product WHERE pid=?',[pid], (err, rows) => {
      if(rows == '') {
        console.log('Not Found - GET Link');
        res.status(404).send('Not Found');
      }
      else {
        if (err) {
          connection.release();
          console.log('Internal Server Error - GET Link');
          res.status(500).send('Internal Server Error');
          throw err;
        }

        var shoplink = rows[0].link;

        if (shoplink === null) {
          let q = rows[0].pname;
          getLinkOptions.qs.query = q;
          request(getLinkOptions, (err, result, body) => {
            if (err) { 
              connection.release();
              console.log('Link Error - Naver API Request error');
              res.status(500).send('Link Error');
              throw err;
            } 
            
            body = JSON.parse(body);
            let item = body.items[0];
            shoplink = item.link;
            console.log(item); 
            connection.query('UPDATE product SET link=? WHERE pid=?',[shoplink, pid], (err, rows) => {
              if (err) {
                connection.release();
                console.log('Query Error - GET Link');
                res.status(500).send('Internal Server Error');
                throw err;
              } else {
                res.json({ link : shoplink });
              }
            });
          });
        } 
        else res.json({ link : shoplink });
      }
    });
    connection.release();
  });
});

export default router;
