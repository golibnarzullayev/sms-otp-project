const { Router } = require('express');
const router = Router();
const { userController } = require('../controllers');

router.get('/register', userController.registerPage);
router.post('/register', userController.register);
router.get('/verify', userController.verifyPage);
router.post('/verify', userController.verify);
router.get('/login', userController.loginPage);

module.exports = router;