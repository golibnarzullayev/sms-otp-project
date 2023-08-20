const { Router } = require('express');
const router = Router();
const userRoute = require('./user.route');

router.use('/', userRoute);

module.exports = router;