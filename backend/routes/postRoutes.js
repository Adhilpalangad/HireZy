const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middleware/authMiddleware');
const postController = require('../controllers/postController');

// Multer config for post images
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'post-' + unique + path.extname(file.originalname));
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
  fileFilter: (req, file, cb) => {
    /jpeg|jpg|png|gif|webp/.test(path.extname(file.originalname).toLowerCase())
      ? cb(null, true)
      : cb(new Error('Only image files allowed'));
  }
});

// Public
router.get('/feed', postController.getFeed);
router.get('/user/:userId', postController.getUserPosts);

// Protected
router.post('/', authMiddleware, upload.single('image'), postController.createPost);
router.post('/:postId/like', authMiddleware, postController.toggleLike);
router.delete('/:postId', authMiddleware, postController.deletePost);

module.exports = router;
