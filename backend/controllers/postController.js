const Post = require('../models/Post');
const User = require('../models/User');

// GET /api/posts/user/:userId — get posts for a specific user's profile
exports.getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// GET /api/posts/feed — get all posts for the community feed
exports.getFeed = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('author', 'name role city verificationStatus isVerified');
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// POST /api/posts — create a new post
exports.createPost = async (req, res) => {
  try {
    const { content, tags } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Post content is required.' });
    }

    const user = await User.findById(req.user.userId).select('name');
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    const parsedTags = tags
      ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()).filter(Boolean))
      : [];

    const post = new Post({
      author: req.user.userId,
      authorName: user.name,
      content: content.trim(),
      imageUrl,
      tags: parsedTags
    });

    await post.save();
    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// POST /api/posts/:postId/like — toggle like on a post
exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    const userId = req.user.userId;
    const alreadyLiked = post.likes.some(id => id.toString() === userId.toString());

    if (alreadyLiked) {
      post.likes = post.likes.filter(id => id.toString() !== userId.toString());
    } else {
      post.likes.push(userId);
    }
    await post.save();
    res.json({ likes: post.likes.length, liked: !alreadyLiked });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// DELETE /api/posts/:postId — delete a post (owner only)
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    if (post.author.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post.' });
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};
