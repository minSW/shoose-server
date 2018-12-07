import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  var pool = req.app.get('dbPool');
  pool.getConnection((error, connection) => {
    connection.query('SELECT * from product', function(err, rows, result){
      if (err){
        connection.release();
        console.log('Internal Server Error - GET all product list');
        res.status(500).send('Internal Server Error');
        throw err;
      }
      let total = rows.length;
      console.log(rows);
      res.json({ total : total, items : rows });
      //res.send(JSON.parse("items:"+JSON.stringify(rows)));
    });
    connection.release();
  });
});


export default router;