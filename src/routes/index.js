import express from 'express';
import user from './user';
import product from './product';
import search from './search';
import recommend from './recommend';
import jwt from 'jsonwebtoken';
import config from '../config';

const router = express.Router();
router.use('/usr', user);
router.use('/prod', isLoggedIn(), product);
router.use('/search', isLoggedIn(), search);
router.use('/recommend', isLoggedIn(), recommend);

export default router;

// auth
function isLoggedIn () {
  return function(req, res, next) {
    let token = req.cookies.user;
    jwt.verify(token, config.secret, (err) => {
      if (err && err.name === 'TokenExpiredError') {
        return res.status(400).send('Token Expired');
      } else if (err) {
        return res.status(500).send('Server Error');
      } else {
        return next();
      }
    });

    /*
    if (req.session.isLogin) {
      return next();
    }
    else {
      return res.status(400).send('need to login');
    }
    */
  }
}