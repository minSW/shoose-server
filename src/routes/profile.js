import express from 'express';

const router = express.Router();

router.post('/', (req, res, next) => {
  var pool = req.app.get('dbPool');
  pool.getConnection((error, connection) => {
    connection.query('UPDATE users set ? WHERE SN = ?', [req.body, req.body.SN], (err, rows, result) => {
      console.log(req.body);
      if (err) {
        connection.release();
        console.log('Query Error - POST profile');
        res.status(500);
        res.json({ message: 'error', result: 'profile' });
        throw err;
      }
      connection.release();
      res.status(200);
      res.json({ message: 'success', result:'profile' });
    });
  });
});

export default router;
