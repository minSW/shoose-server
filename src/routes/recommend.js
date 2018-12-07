import express from 'express';
import {PythonShell} from 'python-shell';

const router = express.Router();


var options = {
  mode: 'text',
  pythonPath: '',
  pythonOptions: ['-u'],
  scriptPath: './src',
  args: [[1,5], [3,2], [7,0]]
};

/*
PythonShell.run('test.py', options, function (err, results) {
  if (err) throw err;
  console.log('results: %j', results);
});
*/

router.get('/', (req, res) => {
  let pid = req.query.uid;
  res.send('Recommend part');
  // res.json(..)
});

export default router;