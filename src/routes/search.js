import express from 'express';
import bodyParser from 'body-parser';

const router = express.Router();

router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());

router.get('/', (req, res) => {
  let keyword = req.query.key;
  res.send('Search part');
  // res.json(..)
});

export default router;