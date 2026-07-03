const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../config/multer');
const {
  updateProfileValidator,
  changePasswordValidator,
  changeEmailValidator
} = require('../validators/userValidators');

const router = express.Router();

// Apply auth guard to all user routes
router.use(authMiddleware);

router.get('/profile/:username', userController.getProfile);
router.get('/profile/:username/posts', userController.getUserPosts);
router.patch('/profile', upload.single('profilePicture'), updateProfileValidator, userController.updateProfile);
router.patch('/change-password', changePasswordValidator, userController.changePassword);
router.patch('/account', changeEmailValidator, userController.changeEmail);
router.get('/search', userController.search);

router.post('/:userId/follow', userController.follow);
router.delete('/:userId/follow', userController.unfollow);

router.get('/:userId/followers', userController.getFollowers);
router.get('/:userId/following', userController.getFollowing);

module.exports = router;
