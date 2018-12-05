import express from 'express';

const router = express.Router();


router.get('/', (req, res) => {
  let keyword = req.query.key;
  res.send('Search part');
  // res.json(..)
});

export default router;