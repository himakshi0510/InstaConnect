const express = require('express');
const postController = require('../controllers/postController');
const likeController = require('../controllers/likeController');
const commentController = require('../controllers/commentController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../config/multer');
const { postValidator } = require('../validators/postValidators');
const { commentValidator } = require('../validators/commentValidators');

const router = express.Router();

// Auth guard on all posts routes
router.use(authMiddleware);

// Base post operations
router.post('/', upload.single('image'), postValidator, postController.create);
router.get('/feed', postController.getFeed);
router.get('/explore', postController.getExplore);
router.get('/:postId', postController.getPostDetails);
router.patch('/:postId', postValidator, postController.updateCaption);
router.delete('/:postId', postController.delete);

// Nested Likes routes
router.post('/:postId/like', likeController.like);
router.delete('/:postId/like', likeController.unlike);

// Nested Comments routes
router.get('/:postId/comments', commentController.getComments);
router.post('/:postId/comments', commentValidator, commentController.create);
router.delete('/:postId/comments/:cid', commentController.delete);

module.exports = router;
