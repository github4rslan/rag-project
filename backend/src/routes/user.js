const express = require('express');
const {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
} = require('../controllers/userController');

const router = express.Router();

router.get('/',               getProfile);
router.put('/update',         updateProfile);
router.put('/change-password', changePassword);
router.delete('/delete',      deleteAccount);

module.exports = router;