import express from 'express';
import { PythonShell } from 'python-shell';

const router = express.Router();

var options = {
  mode: 'text',
  pythonPath: '',
  pythonOptions: ['-u'],
  scriptPath: './src',
  args: 0
};

router.get('/:SN', (req, res, next) => {
  options.args = req.params.SN;

  PythonShell.run('shoose.py', options, (err, results) => {
    if (err || results[0]==="error") {
      console.log("Internal Server Error - Recommend with python");
      res.status(500).send('Internal Server Error');
      throw err;
    }

    const result = results[0].substring(1,results[0].length-1).split(", "); //.map(Number);
    console.log("success ", result);

    var pool = req.app.get('dbPool');
    pool.getConnection((error, connection) => {
      var q = "SELECT * FROM product WHERE pid IN ("+result+")";
      connection.query(q, (err, rows, result) => {
        if (err){
          connection.release();
          console.log('Internal Server Error - GET recommend');
          res.status(500).send('Internal Server Error');
          throw err;
        }
        // console.log(rows);
        connection.release();
        let total = rows.length;
        res.json({ total : total, items : rows });
      });
    });

  });
});

router.post('/result', (req, res, next) => {
  var pool = req.app.get('dbPool');
  pool.getConnection((error, connection) => {
    connection.query(`INSERT INTO user_score(SN,pid,score) SELECT ?,?,? FROM DUAL
    WHERE NOT EXISTS (SELECT * FROM user_score WHERE SN=? and pid=?)`, [req.body.SN, req.body.pid, req.body.score, req.body.SN, req.body.pid], (err, rows, result) => {
      if (err) {
        res.status(500)
        res.json({ message: 'error', result: 'recommend' });
        throw err;
      }
      
      if(rows.affectedRows === 0){
        connection.query('UPDATE user_score SET score=? WHERE SN=? and pid=?', [req.body.score, req.body.SN, req.body.pid], (err, rows, result) => {
          if (err) {
            res.status(500);
            res.json({ message: 'error', result: 'recommend' });
            throw err;
          }
        });
      }
    });

    connection.query(`INSERT INTO preferences (idx,SN,pid,rate) SELECT NULL,?,?,?*0.5 FROM DUAL 
    WHERE NOT EXISTS (SELECT * FROM preferences WHERE SN=? and pid=?)`, [req.body.SN, req.body.pid, req.body.score, req.body.SN, req.body.pid], (err, rows, result) => {
      if (err) {
        res.status(500);
        res.json({ message: 'error', result: 'recommend' });
        throw err;
      }
      
      if (rows.affectedRows === 0) {
        connection.query('UPDATE preferences SET rate=? WHERE SN=? and pid=?', [req.body.score, req.body.SN, req.body.pid], (err, rows, result) => {
          if(err){
            res.status(500);
            res.json({ message: 'error', result: 'recommend' });
            throw err;
          }
        });
      }
    });
    connection.release();
    res.json({ message: 'sucess', result: 'recommend' });
  });
});


export default router;
