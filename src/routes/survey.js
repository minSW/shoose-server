import express from 'express';

const router = express.Router();

router.post('/profile', (req, res, next) => {
  var pool = req.app.get('dbPool');
  pool.getConnection((error, connection) => {
    connection.query('UPDATE users set ? WHERE SN = ?', [req.body, req.body.SN], (err, rows, result) => {
      console.log(req.body);
      if (err) {
        connection.release();
        res.status(500);
        res.json({ message: 'error', result: 'survey' });
        throw err;
      }
      connection.release();
      res.status(200);
      res.json({ message: 'success', result: 'survey' });
    });
  });
});

router.get('/prod', (req, res, next) => {
  var pool = req.app.get('dbPool');
  pool.getConnection((error, connection) => {
    var plist="15,95,150,250,300,350,400,500,550,600,700,730,800,900,1000";
    connection.query('SELECT pname, img_url FROM product WHERE pid in ('+plist+')', (err, rows, result) => {
      if (err) {
        connection.release();
        res.status(500).send("Internal Server Error");
        throw err;
      }
      connection.release();
      res.json(rows);
    });
  });
});

router.post('/result', (req, res, next) => {
  var pool = req.app.get('dbPool');
  pool.getConnection((error, connection) => {
    connection.query('INSERT INTO preferences (idx, SN, pid, rate) values (NULL, ?, ?, ?)', [req.body.SN, req.body.pid, req.body.score], (err, rows, result) => {
      if (err) {
        connection.release();
        res.status(500);
        res.json({ message: 'error', result: 'survey' });
        throw err;
      }
    });
    connection.query('INSERT INTO user_score (SN, pid, score) values (?, ?, ?)', [req.body.SN, req.body.pid, req.body.score], (err, rows, result) => {
      if (err) {
        connection.release();
        res.status(500);
        res.json({ message: 'error', result: 'survey' });
        throw err;
      }
    });
    connection.release();
    res.status(200);
    res.json({ message: 'success', result: 'survey' });
  });
});

export default router;
