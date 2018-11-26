import express from 'express';
import bodyParser from 'body-parser';
import config from '../config';
import session from 'express-session';

const router = express.Router();

router.use(bodyParser.urlencoded({extended: false}));
router.use(bodyParser.json());
/*
app.get('/auth/logout', (req, rew) =>{
    delete req.session.displayName;
    res.redirect('/welcome');
});
*/
var user = {
    id: 'mintest',
    password: '111'
};


router.get('/welcome', (req, res) => {
    if (req.session.displayName) {
        res.send('Success login! You are : ' + req.session.displayName);
       // res.send('Success login!')
    } else {
        res.send('Need to login');
    }
});

router.get('/', (req, res)=>{
    console.log(req.query);
    let id = req.query.id; // need to change, no url parameter
    let pwd = req.query.password; 
   // let id = req.params.id; 
   // let pwd = req.params.password;
    if (id === user.id && pwd === user.password) {
        req.session.displayName = user.id; // temp
        res.redirect('/api/login/welcome');
    } else {
        res.send('Fail to login');
    }
});

export default router;

