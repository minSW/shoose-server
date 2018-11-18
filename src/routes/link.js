import express from 'express';
import request from 'request';
import config from '../config';

const router = express.Router();


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

router.get('/', (req, res) => {
  let q = req.query.q;
  getLinkOptions.qs.query = q;

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

      res.json({ title: item.title, link: item.link });
    }
  });
});

export default router;
