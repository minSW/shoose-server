import express from 'express';
import request from 'request';
import bodyParser from 'body-parser';
import config from '../config';

const router = express.Router();

router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());

/* not yet */
router.get('/', (req, res) => { // show the single page of product
  let pid = req.query.pid;
  res.send('product part');
  // res.json(..)
});

router.post('/like', (req, res) => {
  let uid = req.body.uid,
      pid = req.body.pid;
  //let score = req.body.score;
  res.json({ message: 'success', result: 'product' });
});

router.post('/wish', (req, res) => {
  let uid = req.body.uid,
      pid = req.body.pid;
  res.json({ message: 'success', result: 'product' });
});
/**********/

var getLinkOptions = {
  url: 'https://openapi.naver.com/v1/search/shop.json',
  headers: {
    'X-Naver-Client-Id': config.naver.id,
    'X-Naver-Client-Secret': config.naver.secret
  },
  qs: {
    display: 10,
    start: 1,
    sort: 'sim' // asc
  }
}

router.get('/link', (req, res) => { // need to insert link into DB 
  let pid = req.query.pid; // for searching DB link
  let q = req.query.q;
  getLinkOptions.qs.query = q;

  console.log(pid);
  request(getLinkOptions, (err, result, body) => {
    if (err) { 
      let error = new Error('Link Error');
      error.status = 500;
      throw error;  // error catching in app.js

    } else {
      console.log('statusCode:', result && result.statusCode);
      console.log('body: ', body);
      body = JSON.parse(body);
      let item = body.items[0];
      res.json({ link: item.link });
    }
  });
});

export default router;
