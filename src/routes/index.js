import express from 'express';
import jwt from 'jsonwebtoken';

import user from './user';
import product from './product';
import search from './search';
import recommend from './recommend';
import profile from './profile';
import survey from './survey';
import config from '../config';

const router = express.Router();
router.use('/usr', user);
router.use('/prod', isLoggedIn(), product);
router.use('/search', isLoggedIn(), search);
router.use('/recommend', isLoggedIn(), recommend);
router.use('/profile', isLoggedIn(), profile);
router.use('/survey', isLoggedIn(), survey);

export default router;

// auth
function isLoggedIn () {
  return function(req, res, next) {
    let token = req.cookies.user;
    jwt.verify(token, config.secret, (err) => {
      if (err && err.name === 'TokenExpiredError') {
        return res.status(404).send('Token Expired');
      } else if (err) {
        return res.status(403).send('Need to Login');
      } else {
        return next();
      }
    });
  }
}
