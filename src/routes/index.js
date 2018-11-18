import express from 'express';
import user from './user';
import link from './link';

const router = express.Router();

router.use('/user', user);
router.use('/link', link);

//module.exports = router;
export default router; // same

