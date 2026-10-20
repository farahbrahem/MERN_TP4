const express = require('express');
const router = express.Router();
const {
  getAllArticles, getArticleById, createArticle, updateArticle, deleteArticle
} = require('../controllers/articleController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', getAllArticles);
router.get('/:id', getArticleById);
router.post('/', protect, createArticle);
router.put('/:id', protect, updateArticle);
router.delete('/:id', protect, deleteArticle);

module.exports = router;