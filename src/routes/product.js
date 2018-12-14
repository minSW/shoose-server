import express from 'express';
import request from 'request';
import config from '../config';

const router = express.Router();

router.get('/:pid', (req, res, next) => {
  var pool = req.app.get('dbPool');
  pool.getConnection((error, connection) => {
    connection.query('SELECT * FROM product WHERE pid=?',[req.params.pid], (err, rows, result) => {
      if (err) {
        connection.release();
        console.log('Internal Server Error - GET Product Info');
        res.status(500).send('Internal Server Error');
        throw err;
      }

      if (rows == '') {
        console.log('Not Found - GET Product Info');
        res.status(404).send('Not Found');
      }
      else{
        res.json(rows[0]);
      }
      connection.release();
    });
  });
});

router.post('/like', (req, res) => {
  var pool = req.app.get('dbPool');
  pool.getConnection((error, connection) => {
    connection.query(`INSERT INTO user_score(SN,pid,score) SELECT ?,?,? FROM DUAL
    WHERE NOT EXISTS (SELECT * FROM user_score WHERE SN=? and pid=?)`, [req.body.SN, req.body.pid, req.body.score, req.body.SN, req.body.pid], (err, rows, result) => {
      if (err) {
        connection.release();
        console.log('Query Error - POST like_user');
        res.status(500);
        res.json({message: 'error', result: 'product'});
        throw err;
      }

      if (rows.affectedRows === 0) { // already exist the user's score of the product
        connection.query('UPDATE user_score SET score=? WHERE SN=? and pid=?', [req.body.score, req.body.SN, req.body.pid], (err, rows, result) => {
          if (err) {
            connection.release();
            res.status(500);
            res.json({ message: 'error', result: 'product' });
            throw err;
          }
        });
      }
      if (req.body.score >= 4) { // if score is higher than 4.0, it means that the user 'like' the product
        connection.query(`INSERT INTO like_user (SN,pid) SELECT ?,? FROM DUAL 
        WHERE NOT EXISTS (SELECT * FROM like_user WHERE SN=? and pid=?)`, [req.body.SN, req.body.pid, req.body.SN, req.body.pid ], (err, rows, result) => {
          if (err) {
            connection.release();
            res.status(500);
            res.json({ message: 'error', result: 'product' });
            throw err;
          }
        });
      }

      // Apply change to preference DB
      connection.query(`INSERT INTO preferences (idx,SN,pid,rate) SELECT NULL,?,?,?*0.5 FROM DUAL 
      WHERE NOT EXISTS (SELECT * FROM preferences WHERE SN=? and pid=?)`, [req.body.SN, req.body.pid, req.body.score, req.body.SN, req.body.pid], (err, rows, result) => {
        if (err) {
          connection.release();
          res.status(500);
          res.json({ message: 'error', result: 'product' });
          throw err;
        }
        if (rows.affectedRows === 0) { // already exist the preference of the product
          connection.query('UPDATE preferences SET rate=? WHERE SN=? and pid=?', [req.body.score, req.body.SN, req.body.pid], (err, rows, result) => {
            if (err) {
              connection.release();
              res.status(500);
              res.json({ message: 'error', result: 'product' });
              throw err;
            }
          });
        }
        connection.release();
        res.json({ message: 'success', result: 'product' });
      });
    });
  });
});

router.get('/like/:SN/:pid', (req, res) => {
  var pool = req.app.get('dbPool');
  pool.getConnection((error, connection) => {
    connection.query('SELECT * FROM user_score WHERE SN=? and pid=?',[req.params.SN, req.params.pid], (err, rows, result) => {
      if (err){
        connection.release();
        console.log('Internal Server Error - GET like_user');
        res.status(500).send('Internal Server Error');
        throw err;
      }

      if (rows == '') {
        console.log('Not Found - GET like_user');
        res.status(404).send('Not Found');
      }
      else {
        res.json(rows);
      }
      connection.release();
    });
  });
});

router.post('/wish', (req, res) => {
  var pool = req.app.get('dbPool');
  pool.getConnection((error, connection) => {
    connection.query(`INSERT INTO wish_list (SN,pid) SELECT ?,? FROM DUAL 
    WHERE NOT EXISTS (SELECT * FROM wish_list WHERE SN=? and pid=?)`, [req.body.SN, req.body.pid, req.body.SN, req.body.pid ], (err, rows, result) => {
      if (err) {
        connection.release();
        console.log('Query Error - POST wish_list');
        res.status(500);
        res.json({ message: 'error', result: 'product' });
      }
      
      if (rows.affectedRows === 0) {
        connection.release();
        console.log('Conflict - POST wish_list');
        res.status(409);
        res.json({ message: 'conflict', result: 'product' });
      }
      else {
        connection.query(`INSERT INTO preferences (idx,SN,pid,rate) SELECT NULL,?,?,2 FROM DUAL 
        WHERE NOT EXISTS (SELECT * FROM preferences WHERE SN=? and pid=?)`, [req.body.SN, req.body.pid, req.body.SN, req.body.pid], (err, rows, result) => {
          if (err) {
            connection.release();
            res.status(500);
            res.json({ message: 'error', result: 'product' });
            throw err;
          }
          
          if (rows.affectedRows === 0) {
            connection.query('UPDATE preferences SET rate=rate+1 WHERE SN=? and pid=?', [req.body.SN, req.body.pid], (err, rows, result) => {
              if (err) {
                connection.release();
                res.status(500);
                res.json({ message: 'error', result: 'product' });
                throw err;
              }
            });
          }
          connection.release();
          res.json({ message: 'success', result: 'product' });
        });
      }
    });

  });
});

router.get('/wish/:SN', (req, res, next) => {
  var pool = req.app.get('dbPool');
  pool.getConnection((error, connection) => {
    connection.query('SELECT * FROM wish_list WHERE SN=?',[req.params.SN], (err, rows, result) => {
      if (err) {
        connection.release();
        console.log('Internal Server Error - GET wish_list');
        res.status(500).send('Internal Server Error');
        throw err;
      }

      if (rows == '') {
        console.log('Not Found - GET wish_list');
        res.status(404).send('Not Found');
      }
      else {
        res.json(rows);
      }
      connection.release();
    });
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

router.get('/link/:pid/:SN', (req, res) => { 
  let pid = req.params.pid; 
  var pool = req.app.get('dbPool');

  pool.getConnection((error, connection) => {
    connection.query('SELECT pid, pname, link FROM product WHERE pid=?',[pid], (err, rows) => {
      if (err) {
        connection.release();
        console.log('Internal Server Error - GET Link');
        res.status(500).send('Internal Server Error');
        throw err;
      }

      if (rows == '') {
        console.log('Not Found - GET Link');
        res.status(404).send('Not Found');
      }
      else {
        var shoplink = rows[0].link;

        connection.query(`INSERT INTO preferences (idx,SN,pid,rate) SELECT NULL,?,?,1 FROM DUAL 
        WHERE NOT EXISTS (SELECT * FROM preferences WHERE SN=? and pid=?)`, [req.params.SN, req.params.pid, req.params.SN, req.params.pid], (err, rows, result) => {
          if (err) {
            connection.release();
            res.status(500).send('Internal Server Error');
            throw err;
          }
          
          if (rows.affectedRows == 0) {
            connection.query('UPDATE preferences SET rate=rate+0.5 WHERE SN=? and pid=?', [req.params.SN, req.params.pid], (err, rows, result) => {
              if(err){
                connection.release();
                res.status(500).send('Internal Server Error');
                throw err;
              }
            });
          }
        });

        if (shoplink === null) { // if not exist the link in DB
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
            if (body.total === 0) { // There isn't the result of searching with Naver
              res.status(404);
              res.json({ message: 'none', result: 'link'});
              throw err;
            } 
            let item = body.items[0];
            shoplink = item.link;
            console.log("The best product of "+body.total+" items");
            console.log(item); 

            connection.query('UPDATE product SET link=? WHERE pid=?',[shoplink, pid], (err, rows) => {
              if (err) {
                connection.release();
                console.log('Query Error - GET Link');
                res.status(500).send('Internal Server Error');
                throw err;
              }
              res.json({ link : shoplink }); 
            });
          });
        }
        else {
          res.json({ link : shoplink });
        }
        connection.release();
      }
    });
  });
});

export default router;
