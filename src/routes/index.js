import express from 'express';
import user from './user';
import product from './product';
import search from './search';
import recommend from './recommend';

//import login from './session';

const router = express.Router();

router.use('/usr', user);
router.use('/prod',product);
router.use('/search',search);
router.use('/recommend',recommend);

//router.use('/login', login);

export default router;
