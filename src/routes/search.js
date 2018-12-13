import express from 'express';
// import { connect } from 'net';

const router = express.Router();

router.get('/:SN', (req, res) => {
  var pool = req.app.get('dbPool');
  pool.getConnection((error, connection) => {
    connection.query('SELECT * FROM product', (err, rows, result) => {
      if (err) {
        connection.release();
        console.log('Internal Server Error - GET all product list');
        res.status(500).send('Internal Server Error');
        throw err;
      }

      let total = rows.length;
      connection.query('SELECT score FROM user_score WHERE SN=?', req.params.SN, (err, scores, result) => {
        if (err) {
          connection.release();
          res.status(500).send('Internal Server Error');
          throw err;
        }
        connection.release();
        res.json({ total : total, items : rows, score : scores }); 
          // total : # of products, items : {product's info}, score : user's own score
      });
    });
  });
});

export default router;
