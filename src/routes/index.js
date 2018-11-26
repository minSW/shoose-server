import express from 'express';
import user from './user';
import link from './link';
import login from './session';

const router = express.Router();

router.use('/user', user);
router.use('/link', link);
router.use('/login', login);

//module.exports = router;
export default router; // same

