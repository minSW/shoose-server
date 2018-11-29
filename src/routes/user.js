import express from 'express';
import bodyParser from 'body-parser';
//import config from '../config';
import session from 'express-session';

const router = express.Router();

router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());

//not yet connecting
var user = {
    uid: 0,
    id: '',
    password: ''
}

router.post('/signup', (req, res) => {
  let id = req.body.id,
      password = req.body.password;
  user.uid+=1;
  user.id=id;
  user.password=password; // need to connect with mySQL & check duplicate
  res.json({ message: 'success', result: 'user' });
});

router.post('/login', (req, res) => {
  let id = req.body.id,
      password = req.body.password;
  if (user.id===id && user.password===password){ // need to check DB
      req.session.displayName = user.id;
      res.json({ uid: user.uid, message: 'success', result: 'user' });
  } else {
      res.json({ message: 'error', result: 'user' });
  }
});
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

export default router;
