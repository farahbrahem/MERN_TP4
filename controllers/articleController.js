const Article = require('../models/articleModel');

const isOwnerOrAdmin = (article, user) =>
  article.author.toString() === user._id.toString() || user.role === 'admin';

// GET /api/articles (public)
const getAllArticles = async (req, res) => {
  try {
    const articles = await Article.find().populate('author', 'name email role');
    res.status(200).json(articles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/articles/:id (public)
const getArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).populate('author', 'name email role');
    if (!article) return res.status(404).json({ message: 'Article not found' });
    res.status(200).json(article);
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid article ID format' });
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/articles (protégé) : l'auteur vient du token
const createArticle = async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }
    const newArticle = await Article.create({ title, content, author: req.user._id });
    const populated = await newArticle.populate('author', 'name email role');
    res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/articles/:id (auteur ou admin)
const updateArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: 'Article not found' });
    if (!isOwnerOrAdmin(article, req.user)) {
      return res.status(403).json({ message: 'Forbidden: you are not the author of this article' });
    }

    article.title = req.body.title || article.title;
    article.content = req.body.content || article.content;
    const updated = await article.save();
    const populated = await updated.populate('author', 'name email role');
    res.status(200).json(populated);
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid article ID format' });
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/articles/:id (auteur ou admin)
const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: 'Article not found' });
    if (!isOwnerOrAdmin(article, req.user)) {
      return res.status(403).json({ message: 'Forbidden: you are not the author of this article' });
    }

    await Article.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Article deleted successfully', id: req.params.id });
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid article ID format' });
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAllArticles, getArticleById, createArticle, updateArticle, deleteArticle };